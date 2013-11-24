define(['underscore'], function(_, reporting) {
  return {
    name: 'Reporting',
    initialize: function(app) {
      var module;
      module = {
        track: function() {
          return this.track = function(name, data) {
            var defaultData;
            if (data == null) {
              data = {};
            }
            defaultData = _.result(this, 'trackingData');
            defaultData = _.isObject(defaultData) ? defaultData : {};
            data = _.extend({
              id: this.id,
              component: this.options.name
            }, defaultData, data);
            return this.sandbox.track(name, data);
          };
        },
        initialize: function(app) {
          var core = app.core;
          var sandbox = app.sandbox;
          reporting.then(function(reporting){
            sandbox.track = function(eventName, params) {
              return reporting.track(eventName, params);
            };
            sandbox.flag = function(id) {
              return reporting.flag(id);
            };
          });
          return app.components.before('initialize', module.track);
        }
      };
      return module;
    }
  };
});
