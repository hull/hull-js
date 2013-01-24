define([ "sandbox" ], function(sandbox) {
    return sandbox.widgets.create({
        namespace: "activity",
        templates: [ "activity" ]
    });
});

this["Hull"] = this["Hull"] || {};

this["Hull"]["templates"] = this["Hull"]["templates"] || {};

this["Hull"]["templates"]["_default"] = this["Hull"]["templates"]["_default"] || {};

this["Hull"]["templates"]["_default"]["activity/templates/activity"] = Handlebars.template(function(Handlebars, depth0, helpers, partials, data) {
    helpers = helpers || Handlebars.helpers;
    data = data || {};
    return "Activities Here...";
});