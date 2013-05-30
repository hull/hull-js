(function() {
  define({
    name: "The Back of the Bone",
    require: {
      paths:  { backbone: 'components/backbone/backbone' },
      shim:   { backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] } }
    },

    initialize: function(app) {
      var core = app.core, sandbox = app.sandbox;
      var Backbone = require('backbone');

      core.mvc = Backbone.noConflict();
      core.Widgets.Backbone = core.mvc.View;

      sandbox.mvc = {};
      sandbox.mvc.View = function(view) {
        return core.mvc.View.extend(view);
      };
      sandbox.mvc.Model = function(model) {
        return core.mvc.Model.extend(model);
      };
      sandbox.mvc.Collection = function(collection) {
        return core.mvc.Collection.extend(collection);
      };
    },

    afterAppStart: function(app) {
      _.delay(function() {
        if (!app.core.mvc.History.started) {
          app.core.mvc.history.start();
        };
      }, 500);
    }
  });
})();
