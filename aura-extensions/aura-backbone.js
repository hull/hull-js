(function() {
  var historyStarted = false;
  define({
    name: "The Back of the Bone",
    config: {
      require: {
        paths:  { backbone: 'backbone/backbone' },
        shim:   { backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] } }
      }
    },

    init: function(env) {
      var core = env.core, sandbox = env.sandbox;
      var Backbone = require('backbone');

      core.mvc =  Backbone;
      core.Widgets.Backbone = Backbone.View;

      sandbox.mvc = {};
      sandbox.mvc.View = function(view) {
        return core.mvc.View.extend(view);
      },
      sandbox.mvc.Model = function(model) {
        return core.mvc.Model.extend(model);
      },
      sandbox.mvc.Collection = function(collection) {
        return core.mvc.Collection.extend(collection);
      }

    },

    afterAppStart: function(env) {
      if (!historyStarted) {
        env.core.mvc.history.start();
        historyStarted = true;
      }
    }
  })
})();
