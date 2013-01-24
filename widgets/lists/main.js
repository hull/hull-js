define({
    type: "Hull",
    templates: [ "lists" ],
    events: {
        "submit form": "createList"
    },
    datasources: {
        lists: ":id/lists"
    },
    createList: function(e) {
        e.preventDefault();
        var self = this, inputs = {};
        this.sandbox.dom.find("input", this.$el).each(function(c, input) {
            if (input.getAttribute("type") === "text") {
                inputs[input.getAttribute("name")] = input.value;
            }
        });
        this.api("hull/" + this.id + "/lists", "post", inputs).then(function() {
            self.render();
        });
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["lists/lists"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += "\n  <h1>My lists....</h1>\n  ";
        foundHelper = helpers.lists;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
        } else {
            stack1 = depth0.lists;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.lists) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.noop,
                fn: self.program(2, program2, data),
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n\n  <h1>Create a new List</h1>\n  <form>\n    <p>\n      Name:\n      <input type="text" name="name">\n    </p>\n    <p>\n      Description:\n      <input type="text" name="description">\n    </p>\n    <input type="submit" name="Create my collection">\n  </form>\n\n';
        return buffer;
    }
    function program2(depth0, data) {
        var buffer = "", stack1, stack2, foundHelper;
        buffer += "\n    <h3>";
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
        buffer += escapeExpression(stack1) + "</h3>\n    <ul>\n    ";
        foundHelper = helpers.items;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.noop,
                fn: self.program(3, program3, data),
                data: data
            });
        } else {
            stack1 = depth0.items;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.items) {
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
        buffer += "\n    ";
        foundHelper = helpers.items;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                inverse: self.program(5, program5, data),
                fn: self.noop,
                data: data
            });
        } else {
            stack1 = depth0.items;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        stack2 = {};
        if (!helpers.items) {
            stack1 = blockHelperMissing.call(depth0, stack1, {
                hash: stack2,
                inverse: self.program(5, program5, data),
                fn: self.noop,
                data: data
            });
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n    </ul>\n  ";
        return buffer;
    }
    function program3(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += "\n      <li>\n        [";
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
        buffer += escapeExpression(stack1) + "] ";
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
        buffer += escapeExpression(stack1) + " ";
        foundHelper = helpers.description;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.description;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + "\n      </li>\n    ";
        return buffer;
    }
    function program5(depth0, data) {
        return "\n      <li>\n        Empty Collection\n      </li>\n    ";
    }
    function program7(depth0, data) {
        return "\n  Connect to view your lists...\n";
    }
    stack1 = depth0.loggedIn;
    stack2 = {};
    stack1 = helpers["if"].call(depth0, stack1, {
        hash: stack2,
        inverse: self.program(7, program7, data),
        fn: self.program(1, program1, data),
        data: data
    });
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    return buffer;
});