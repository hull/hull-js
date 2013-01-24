define({
    type: "Hull",
    templates: [ "friends_list" ],
    datasources: {
        friends: function() {
            return this.api("hull/me/friends");
        }
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["friends_list/friends_list"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += '\n  <li>\n    <img src="';
        foundHelper = helpers.picture;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.picture;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '" alt="';
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
        buffer += escapeExpression(stack1) + '">\n    ';
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
        buffer += escapeExpression(stack1) + "\n  </li>\n  ";
        return buffer;
    }
    buffer += "<h1>My Friends</h1>\n<ul>\n  ";
    foundHelper = helpers.friends;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(1, program1, data),
            data: data
        });
    } else {
        stack1 = depth0.friends;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.friends) {
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
    buffer += "\n</ul>";
    return buffer;
});