define(['underscore', 'lib/api/reporting'], function(_, reporting) {
  var module = {
    track: function() {
      this.track = function(name, data) {
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
      var sandbox = app.sandbox;
      sandbox.track = function(eventName, params) {
        return reporting.get().track(eventName, params);
      };
      sandbox.flag = function(id) {
        return reporting.get().flag(id);
      };
      return app.components.before('initialize', module.track);
    }
  };
  return module;
});
