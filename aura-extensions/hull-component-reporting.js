define(['underscore', 'lib/api/reporting'], function(_, reporting) {
  var module = {
    setup: function() {
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
      var _reporting = reporting.init(app.core.data.hullApi);
      var sandbox = app.sandbox;
      sandbox.track = function(eventName, params) {
        return _reporting.track(eventName, params);
      };
      sandbox.flag = function(id) {
        return _reporting.flag(id);
      };
      return app.components.before('initialize', module.setup);
    }
  };
  return module;
});
