define({
    type: "Hull",
    templates: [ "identity" ]
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["identity/identity"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var stack1, stack2, functionType = "function", escapeExpression = this.escapeExpression, self = this;
    function program1(depth0, data) {
        var buffer = "", stack1;
        buffer += "\nHello I am ";
        stack1 = depth0.me;
        stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        buffer += escapeExpression(stack1) + "\n<hr>\n<button data-hull-action='logout'>Bye bye !</button>\n";
        return buffer;
    }
    function program3(depth0, data) {
        return "\nPlease <button data-hull-action='login' data-hull-provider='facebook'>Login</button> first\n";
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
        return stack1;
    } else {
        return "";
    }
});