define({
    type: "Hull",
    templates: [ "achieve_button" ],
    actions: {
        achieve: function() {
            this.api("hull/" + this.id + "/achieve", "post", {
                secret: this.options.secret
            }).then(this.refresh);
        }
    },
    datasources: {
        achievement: function() {
            return this.api("hull/" + this.id);
        }
    },
    beforeRender: function(data) {
        if (data.achievement && data.achievement.badge) {
            data.isAchieved = true;
        } else {
            data.isAchieved = false;
            if (data.loggedIn && this.options.secret) {
                data.canAchieve = true;
            } else {
                data.canAchieve = false;
            }
        }
        return data;
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["achieve_button/achieve_button"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, stack2, functionType = "function", escapeExpression = this.escapeExpression, self = this;
    function program1(depth0, data) {
        var buffer = "", stack1;
        buffer += '\n  <button class="btn btn-success">[DONE] Checked (';
        stack1 = depth0.achievement;
        stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        buffer += escapeExpression(stack1) + ")</button>\n";
        return buffer;
    }
    function program3(depth0, data) {
        var buffer = "", stack1, stack2;
        buffer += '\n  <button class="btn ';
        stack1 = depth0.canAchieve;
        stack2 = {};
        stack1 = helpers.unless.call(depth0, stack1, {
            hash: stack2,
            inverse: self.noop,
            fn: self.program(4, program4, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '" data-hull-action="achieve">CheckIn (';
        stack1 = depth0.achievement;
        stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        buffer += escapeExpression(stack1) + ")</button>\n";
        return buffer;
    }
    function program4(depth0, data) {
        return "disabled";
    }
    stack1 = depth0.isAchieved;
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
    buffer += "\n";
    return buffer;
});