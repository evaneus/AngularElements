(function (w) {

    var PROPERTY_DELIMITER_CHARACTERS = [':', '-', '_'];

    var registrationFunction = (document.registerElement || document.register).bind(document);

    if (registrationFunction === undefined) {
        return;
    }

    var registerAngular = function (elementName, directiveName) {
        var elementPrototype = Object.create(HTMLElement.prototype);
        elementPrototype.createdCallback = function () {
            this._content = getContentNodes(this);
            this.angularDirective = {};
            this.angularDirective = undefined;//TODO Create instance of directive

            //TODO extend node with directive methods
            //TODO extend scope with attributes
            /*extend(this, this.angularDirective);

            getterSetter(this, 'props', function () {
                return this.reactiveElement.props;
            }, function (value) {
                this.reactiveElement.props = value;
            });

            React.renderComponent(this.reactiveElement, this);*/
        };

        elementPrototype.attributeChangedCallback = function () {
            //TODO refresh content of scope of this.angularDirective with tag attributes
            //TODO rerender directive if attribute changed
        }

        registrationFunction(elementName, {
            prototype: elementPrototype
        });
    };

    document.registerAngular = registerAngular;

    if (w.xtag !== undefined) {
        w.xtag.registerAngular = registerAngular;
    }

    var extend = function (extandable, extending) {
        for (var i in extending) {
            if (extandable[i] === undefined) {

                if (typeof extending[i] === 'function') {
                    extandable[i] = extending[i].bind(extending);
                } else {
                    extandable[i] = extending[i];
                }
            }
        }
    };

    var getContentNodes = function (el) {
        var fragment = document.createElement('content');
        while(el.childNodes.length) {
            fragment.appendChild(el.childNodes[0]);
        }
        return fragment;
    };

    var getAllProperties = function (el, attributes) {
        var result = {};

        for (var i = 0; i < attributes.length; i++) {
            var attribute = attributes[i];
            var propertyName = attributeNameToPropertyName(attribute.name);
            result[propertyName] = parseAttributeValue(attributes[i].value);
        }

        result._content = el._content;
        return result;
    };

    var attributeNameToPropertyName = function (attributeName) {
        var result = attributeName.replace('x-', '').replace('data-', '');
        var delimiterIndex = -1;

        while ((delimiterIndex = getNextDelimiterIndex(result)) !== -1) {
            result = result.slice(0, delimiterIndex) + result.charAt(delimiterIndex + 1).toUpperCase() + result.slice(delimiterIndex + 2, result.length);
        }

        return result;
    };

    var getNextDelimiterIndex = function (string) {
        var result = -1;

        for (var i = 0; i < PROPERTY_DELIMITER_CHARACTERS.length; i++) {
            var char = PROPERTY_DELIMITER_CHARACTERS[i];
            result = string.indexOf(char);
            if (result !== -1) {
                break;
            }
        }

        return result;
    }

    var parseAttributeValue = function (value) {
        var regexp = /\{.*?\}/g;
        var matches = value.match(regexp);

        if (matches !== null && matches !== undefined && matches.length > 0) {
            value = eval(matches[0].replace('{', '').replace('}', ''));
        }

        return value;
    };

    var getterSetter = function (variableParent, variableName, getterFunction, setterFunction) {
        if (Object.defineProperty) {
            Object.defineProperty(variableParent, variableName, {
                get: getterFunction,
                set: setterFunction
            });
        }
        else if (document.__defineGetter__) {
            variableParent.__defineGetter__(variableName, getterFunction);
            variableParent.__defineSetter__(variableName, setterFunction);
        }

        variableParent["get" + variableName] = getterFunction;
        variableParent["set" + variableName] = setterFunction;
    };
})(window);

//Mozilla bind polyfill
if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        if (typeof this !== "function") {
            // closest thing possible to the ECMAScript 5 internal IsCallable function
            throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
        }

        var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {
            },
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis
                    ? this
                    : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}
