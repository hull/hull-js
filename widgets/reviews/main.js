define([ "sandbox" ], function(sandbox) {
    var ReviewsCollection = sandbox.mvc.Collection({
        comparator: function(c) {
            return -1 * new Date(c.get("updated_at")).getTime();
        }
    });
    return sandbox.widgets.create({
        namespace: "reviews",
        templates: [ "reviews" ],
        initialize: function(options) {
            var self = this, reviews = this.reviews = new ReviewsCollection([]);
            reviews.url = this.id + "/reviews";
            this.datasources.reviewable = function() {
                return self.sandbox.data.api("hull/" + self.id, {
                    fields: "reviews"
                });
            };
        },
        beforeRender: function(data) {
            data.reviews = this.reviews.reset(data.reviewable.reviews).toJSON();
            return data;
        },
        afterRender: function() {
            var area = this.dom.find("textarea", this.$el);
            area.focus();
        },
        actions: {
            review: function() {
                var description = this.dom.find("textarea", this.$el).val(), rating = this.dom.find("select", this.$el).val(), self = this;
                this.sandbox.data.api.post("hull", this.id + "/reviews", {
                    description: description,
                    rating: rating
                }).done(function() {
                    self.render();
                });
            }
        }
    });
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["reviews/templates/reviews"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, foundHelper, self = this, functionType = "function", escapeExpression = this.escapeExpression, blockHelperMissing = helpers.blockHelperMissing;
    function program1(depth0, data, depth1) {
        var buffer = "", stack1, stack2;
        buffer += "\n";
        stack1 = depth1.loggedIn;
        stack2 = {};
        stack1 = helpers["if"].call(depth0, stack1, {
            hash: stack2,
            inverse: self.program(4, program4, data),
            fn: self.program(2, program2, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n<ul>\n";
        return buffer;
    }
    function program2(depth0, data) {
        return '\n<select>\n  <option>1</option>\n  <option>2</option>\n  <option>3</option>\n  <option>4</option>\n  <option>5</option>\n</select>\n<textarea></textarea>\n<button data-hull-action="review">Send</button>\n';
    }
    function program4(depth0, data) {
        return '\n<button data-hull-action="login" data-hull-provider="facebook">Login first</button>\n';
    }
    function program6(depth0, data) {
        var buffer = "", stack1, foundHelper;
        buffer += "\n<li>[";
        foundHelper = helpers.rating;
        if (foundHelper) {
            stack1 = foundHelper.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.rating;
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
        buffer += escapeExpression(stack1) + ", ";
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
    function program8(depth0, data) {
        return "\noops... no reviews for the moment\n";
    }
    buffer += "<h1>(";
    foundHelper = helpers.renderCount;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            data: data
        });
    } else {
        stack1 = depth0.renderCount;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    buffer += escapeExpression(stack1) + ") Reviewable: ";
    stack1 = depth0.reviewable;
    stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
    stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    buffer += escapeExpression(stack1) + '</h1>\n<div data-hull-widget="identity"></div>\n';
    foundHelper = helpers.reviewable;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.programWithDepth(program1, data, depth0),
            data: data
        });
    } else {
        stack1 = depth0.reviewable;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.reviewable) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.programWithDepth(program1, data, depth0),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    foundHelper = helpers.reviews;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.noop,
            fn: self.program(6, program6, data),
            data: data
        });
    } else {
        stack1 = depth0.reviews;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.reviews) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(6, program6, data),
            data: data
        });
    }
    if (stack1 || stack1 === 0) {
        buffer += stack1;
    }
    buffer += "\n";
    foundHelper = helpers.reviews;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            inverse: self.program(8, program8, data),
            fn: self.noop,
            data: data
        });
    } else {
        stack1 = depth0.reviews;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    stack2 = {};
    if (!helpers.reviews) {
        stack1 = blockHelperMissing.call(depth0, stack1, {
            hash: stack2,
            inverse: self.program(8, program8, data),
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