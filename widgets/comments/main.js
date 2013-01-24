define({
    type: "Hull",
    templates: [ "comments" ],
    debug: true,
    initialize: function() {
        this.sandbox.on("collection.hull." + this.id + ".comments.**", function() {
            this.refresh();
        }.bind(this));
    },
    datasources: {
        comments: ":id/comments"
    },
    actions: {
        comment: function(elt, evt, data) {
            var description = this.$el.find("textarea").val();
            if (description && description.length > 0) {
                var comment = this.datasources.comments.create({
                    description: description
                });
                var xhr = comment.save();
                xhr.promise().then(_.bind(this.render, this, null, null));
            }
            evt.stopPropagation();
        }
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["comments/comments"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, functionType = "function", escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data) {
        return '\n  <textarea></textarea>\n  <button data-hull-action="comment">Send</button>\n';
    }
    function program3(depth0, data) {
        return '\n  <button data-hull-action="login" data-hull-provider="facebook">Login first</button>\n';
    }
    function program5(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += "\n  <li>";
        foundHelper = helpers.updated_at;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.updated_at;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + ": ";
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
        buffer += escapeExpression(stack1) + " (by ";
        stack1 = depth0.user;
        stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        buffer += escapeExpression(stack1) + ")</li>\n";
        return buffer;
    }
    function program7(depth0, data) {
        return "\n  oops... no comments for the moment\n";
    }
    stack1 = depth0.loggedIn;
    stack2 = {};
    stack1 = helpers["if"].call(depth0, stack1, {
        hash: stack2,
        inverse: self.program(3, program3, data),
        fn: self.program(1, program1, data),
        data: data
    });
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n\n\n<ul>\n";
    foundHelper = helpers.comments;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(5, program5, data),
            data: data
        });
    } else {
        stack1 = depth0.comments;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.comments) {
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
    buffer += "\n\n";
    foundHelper = helpers.comments;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.program(7, program7, data),
            fn: self.noop,
            data: data
        });
    } else {
        stack1 = depth0.comments;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.comments) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.program(7, program7, data),
            fn: self.noop,
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n</ul>\n\n";
    return buffer;
});