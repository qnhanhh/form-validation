
function Validator(formSelector) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            } else {
                element = element.parentElement;
            }
        }
    }

    var formRules = {};

    //define rules
    var validatorRules = {
        required: function (value) {
            return value ? undefined : 'This field can not be empty'
        },
        email: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Please enter correct email format'
        },
        min: function (min) {
            return function (value) {
                return value.length >= min ? undefined : `Please enter at least ${min} characters`
            }
        },
        identical: function(origin){
            return function(value){
                return value===document.querySelector(origin).value? undefined:`Passwords do not match`
            }
        }
    };

    //1. get form element in DOM according to formSelector
    var formElement = document.querySelector(formSelector);

    //2. only process when formElement exists  
    if (formElement) {
        //get all inputs that have name and rules attribute
        var inputs = formElement.querySelectorAll('[name][rules]');
        //iterate through inputs
        for (var input of inputs) {
            //get rules by splitting the input
            var rules = input.getAttribute('rules').split('|');
            var ruleInfo;

            //iterate through rules
            for (var rule of rules) {
                var ruleFunction;

                if (rule.includes(':')) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                    ruleFunction = validatorRules[ruleInfo[0]](ruleInfo[1]);
                } else {
                    ruleFunction = validatorRules[rule];
                }

                //add rule functions to formRules
                if (Array.isArray(formRules[input.name])) {
                    //push more elements
                    formRules[input.name].push(ruleFunction);
                } else {
                    //initialize the first element of the array
                    formRules[input.name] = [ruleFunction];
                }
            }

            //listen to events to validate (blur, change)
            input.onblur = handleBlur;
            input.oninput = handleTyping;
        }

        //validate function
        function handleBlur(event) {
            var rules = formRules[event.target.name];
            var errorMessage;

            for(var rule of rules){
                errorMessage = rule(event.target.value);
                if(errorMessage) break;
            }

            //if there is an error
            if (errorMessage) {
                var parentElement = getParent(event.target, '.form-group');
                if (parentElement) {
                    parentElement.classList.add('invalid');
                    var formMessage = parentElement.querySelector('.form-message');
                    if (formMessage) {
                        formMessage.innerText = errorMessage
                    }
                }
            }
            return !errorMessage;
        }

        function handleTyping(event) {
            var parentElement = getParent(event.target, '.form-group');
            if (parentElement.classList.contains('invalid')) {
                parentElement.classList.remove('invalid');
                var formMessage = parentElement.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        }
    }

    //submit form
    formElement.onsubmit=function(event){
        event.preventDefault();
        var inputs=formElement.querySelectorAll('[name][rules]');
        var isValid=true;
        for(var input of inputs){
            if(!handleBlur({target:input})){
                isValid=false;
            }
        }

        if(isValid){
            //submit with default html
            formElement.submit();
        }
    }
}