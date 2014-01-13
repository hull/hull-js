(function() {
  if (window.Backbone) {
    define('backbone', [], function () {
      return window.Backbone;
    });
  } else {
    require.config({
      paths:  { backbone: 'components/backbone/backbone' },
      shim:   { backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] } }
    });
  }
  define(['backbone'], {
    name: "The Back of the Bone",

    initialize: function(app) {
      var core = app.core, sandbox = app.sandbox;
      var Backbone = require('backbone');

      core.mvc = Backbone.noConflict();

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
      sandbox.mvc.Router = function(router) {
        return core.mvc.Router.extend(router);
      };
    }

  });
})();
