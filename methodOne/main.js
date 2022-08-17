function Validator(options) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    //variable to store rules
    var selectorRules = {};

    //validate function
    function validate(inputElement, rule) {
        var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorAlert);
        var errorMessage;
        //get rules from selector
        var rules = selectorRules[rule.selector];
        //iterate through rules
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    break;
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerHTML = errorMessage;
            getParent(inputElement, options.formGroup).classList.add('invalid');
        } else {
            errorElement.innerHTML = '';
            getParent(inputElement, options.formGroup).classList.remove('invalid');
        }
        return !!errorMessage;
    }

    //get elements from form
    var formElement = document.querySelector(options.form);
    if (formElement) {
        //when submit the form
        formElement.onsubmit = function (e) {
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(rule => {
                var inputElement = formElement.querySelector(rule.selector);
                var isInvalid = validate(inputElement, rule);
                if (isInvalid) {
                    isFormValid = false;
                }
            });
            if (isFormValid) {
                //submit with javascript
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case 'radio':
                                if (input.matches(':checked')) {
                                    values[input.name] = input.value;
                                }
                                break;
                            case 'checkbox':
                                if(input.matches(':checked')){
                                    if(!Array.isArray(values[input.name])){
                                        values[input.name]=[];
                                    }
                                    values[input.name].push(input.value);
                                }
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
                //submit with default html
                else {
                    formElement.submit();
                }
            }
        }

        //iterate through rules
        options.rules.forEach(rule => {
            //save rules for each input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function (inputElement) {
                //when blur
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                }

                //when typing
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorAlert);
                    errorElement.innerHTML = '';
                    getParent(inputElement, options.formGroup).classList.remove('invalid');
                }
            });
        })
    }
}


//define rules
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || 'Vui lòng nhập trường này';
        }
    };
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'Vui lòng nhập đúng định dạng email';
        }
    };
}

Validator.minLength = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} ký tự`;
        }
    };
}

Validator.isIdentical = function (selector, getIdentical, message) {
    return {
        selector: selector,
        test: function (value) {
            var originPassword = document.querySelector(getIdentical).value;
            return value == originPassword ? undefined : message || `Mật khẩu nhập lại chưa chính xác`;
        }
    }
}