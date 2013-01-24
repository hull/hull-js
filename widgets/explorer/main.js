define([ "./prism" ], {
    type: "Hull",
    templates: [ "explorer" ],
    actions: {
        get: function() {
            var self = this;
            var path = this.sandbox.dom.find("input", this.$el).val();
            self.sandbox.dom.find("code", self.$el).text("loading...");
            this.api("hull/" + path).then(function(response) {
                var prettyJson = JSON.stringify(response, null, "	").replace(/\n/g, "<br>");
                self.sandbox.dom.find("code", self.$el).html(prettyJson);
            });
        }
    }
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["explorer/explorer"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    var buffer = "", stack1, foundHelper, functionType = "function", escapeExpression = this.escapeExpression;
    buffer += '<h1>Hull API Explorer</h1>\n<p><input type="text" value="';
    foundHelper = helpers.path;
    if (foundHelper) {
        stack1 = foundHelper.call(depth0, {
            hash: {},
            data: data
        });
    } else {
        stack1 = depth0.path;
        stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
    }
    buffer += escapeExpression(stack1) + '" placeholder="/path/to/resource"></p>\n<pre class="code language-javascript">\n  <code></code>\n</pre>\n<br />\n<button data-hull-action="get">Get</button>\n';
    return buffer;
});