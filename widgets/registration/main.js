define([ "sandbox", "underscore", "./default_fields", "./jquery.h5validate" ], function(sandbox, _, default_fields) {
    return {
        type: "Hull",
        namespace: "registration",
        templates: [ "registration_form", "registration_complete" ],
        complete: false,
        default_fields: default_fields,
        events: {
            "submit form": "submitForm"
        },
        datasources: {
            fields: function() {
                return this.default_fields || [];
            }
        },
        initialize: function(options, callback) {
            _.bindAll(this);
        },
        validate: function() {
            return this.$el.h5Validate("allValid");
        },
        register: function(profile) {
            var self = this;
            me = this.sandbox.data.api.model("me");
            if (this.loggedIn()) {
                this.api("hull/me/profile", "put", profile, function(myAttrs) {
                    me.set(myAttrs);
                    self.trigger("register", this);
                    self.render();
                });
            }
        },
        beforeRender: function(data) {
            var extra = data.me && data.me.profile || {};
            data.isComplete = _.all(_.map(data.fields, function(f) {
                f.value = extra[f.name] || data.me[f.name];
                return f.value;
            }));
            if (data.isComplete) {
                this.template = "registration_complete";
            } else {
                this.template = "registration_form";
            }
            this.fields = data.fields;
            return data;
        },
        afterRender: function() {
            this.$el.h5Validate();
        },
        submitForm: function() {
            this.actions.submit.apply(this, arguments);
        },
        actions: {
            edit: function(source, e, opts) {
                e.preventDefault();
                e.stopPropagation();
                this.render("registration_form");
                return false;
            },
            submit: function(source, e, opts) {
                e && e.preventDefault();
                if (!this.validate()) {
                    e && e.stopPropagation();
                    e && e.stopImmediatePropagation();
                    return false;
                }
                var fields = _.clone(this.fields), extra = {}, el = this.$el;
                _.map(fields, function(field) {
                    if (field.type == "checkbox") {
                        extra[field.name] = el.find(".h5-" + field.name).is(":checked");
                    } else {
                        extra[field.name] = el.find(".h5-" + field.name).val();
                    }
                });
                this.register(extra);
            }
        }
    };
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["registration/registration_complete"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    return 'Registration complete... thanks\n\n<button data-hull-action="edit">Edit</button>\n';
});

this["Hull"]["templates"]["_default"]["registration/registration_form"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing, helperMissing = helpers.helperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += '\n    <div class="field ';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '">\n        <label for="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '">';
        foundHelper = helpers.label;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.label;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</label>\n\n        ";
        stack1 = depth0.type;
        stack2 = {};
        foundHelper = helpers.ifEqual;
        stack1 = foundHelper ? foundHelper.call(depth0, stack1, "text", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(2, program2, data),
            data: data
        }) : helperMissing.call(depth0, "ifEqual", stack1, "text", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(2, program2, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n\n        ";
        stack1 = depth0.type;
        stack2 = {};
        foundHelper = helpers.ifEqual;
        stack1 = foundHelper ? foundHelper.call(depth0, stack1, "checkbox", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(9, program9, data),
            data: data
        }) : helperMissing.call(depth0, "ifEqual", stack1, "checkbox", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(9, program9, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n\n        ";
        stack1 = depth0.type;
        stack2 = {};
        foundHelper = helpers.ifEqual;
        stack1 = foundHelper ? foundHelper.call(depth0, stack1, "select", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(14, program14, data),
            data: data
        }) : helperMissing.call(depth0, "ifEqual", stack1, "select", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(14, program14, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n\n        <div id="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "_error\" class='error' for=\"";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '">';
        foundHelper = helpers.error;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.error;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</div>\n    </div>\n\n    ";
        return buffer;
    }
    function program2(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += '\n\n            <input\n              class="';
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + " h5-";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              type="';
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              id="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              name="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              value="';
        foundHelper = helpers.value;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.value;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n\n              ';
        foundHelper = helpers.placeholder;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(3, program3, data),
                data: data
            });
        } else {
            stack1 = depth0.placeholder;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.placeholder) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(3, program3, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n              ";
        foundHelper = helpers.pattern;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(5, program5, data),
                data: data
            });
        } else {
            stack1 = depth0.pattern;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.pattern) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(5, program5, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n              ";
        foundHelper = helpers.required;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(7, program7, data),
                data: data
            });
        } else {
            stack1 = depth0.required;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.required) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(7, program7, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n\n              data-h5-errorid="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '_error"\n            />\n\n        ';
        return buffer;
    }
    function program3(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += 'placeholder="';
        foundHelper = helpers.placeholder;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.placeholder;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"';
        return buffer;
    }
    function program5(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += 'pattern="';
        foundHelper = helpers.pattern;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.pattern;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"';
        return buffer;
    }
    function program7(depth0, data) {
        return "required";
    }
    function program9(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += '\n            <input\n              class="';
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + " h5-";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              type="';
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              id="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              name="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              ';
        stack1 = depth0.value;
        stack2 = {};
        foundHelper = helpers.ifEqual;
        stack1 = foundHelper ? foundHelper.call(depth0, stack1, "true", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(10, program10, data),
            data: data
        }) : helperMissing.call(depth0, "ifEqual", stack1, "true", {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(10, program10, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n              placeholder="';
        foundHelper = helpers.placeholder;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.placeholder;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n              ';
        foundHelper = helpers.required;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(12, program12, data),
                data: data
            });
        } else {
            stack1 = depth0.required;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.required) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(12, program12, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n              data-h5-errorid="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '_error"\n            />\n\n        ';
        return buffer;
    }
    function program10(depth0, data) {
        return "checked";
    }
    function program12(depth0, data) {
        return "required";
    }
    function program14(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += "\n            <select\n            class='";
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + " h5-";
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "'\n            type=\"";
        foundHelper = helpers.type;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.type;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n            id="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n            name="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n            ';
        foundHelper = helpers.required;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(15, program15, data),
                data: data
            });
        } else {
            stack1 = depth0.required;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.required) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(15, program15, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n            data-h5-errorid="';
        foundHelper = helpers.name;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.name;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '_error">\n              ';
        foundHelper = helpers.options;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.programWithDepth(program17, data, depth0),
                data: data
            });
        } else {
            stack1 = depth0.options;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.options) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.programWithDepth(program17, data, depth0),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n            </select>\n        ";
        return buffer;
    }
    function program15(depth0, data) {
        return "required";
    }
    function program17(depth0, data, depth1) {
        var buffer = "", stack1, stack2, stack3, foundHelper;
        buffer += '\n                  <option\n                    label="';
        foundHelper = helpers.label;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.label;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n                    value="';
        foundHelper = helpers.value;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.value;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '"\n                    ';
        stack1 = depth0.value;
        stack2 = depth1.value;
        stack3 = {};
        foundHelper = helpers.ifEqual;
        stack1 = foundHelper ? foundHelper.call(depth0, stack2, stack1, {
            hash: stack3,
            inverse: self.noop,
            fn: self.program(18, program18, data),
            data: data
        }) : helperMissing.call(depth0, "ifEqual", stack2, stack1, {
            hash: stack3,
            inverse: self.noop,
            fn: self.program(18, program18, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n                  >";
        foundHelper = helpers.value;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.value;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "</option>\n              ";
        return buffer;
    }
    function program18(depth0, data) {
        return "selected";
    }
    buffer += '<div class="registration">\n  <form>\n\n    ';
    foundHelper = helpers.fields;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    } else {
        stack1 = depth0.fields;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.fields) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += '\n\n    <div class="field">\n      <input type=\'submit\' data-hull-action="submit" value="Valider" />\n    </div>\n  </form>\n</div>\n';
    return buffer;
});