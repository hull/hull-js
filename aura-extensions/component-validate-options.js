define(['underscore', 'jquery'], function(_, $) {
  return function(app) {
    app.components.before('initialize', function(options) {
      var dfd = $.Deferred();
      var optionKeys = _.keys(options);
      _.each(this.requiredOptions || [], function (name) {
        if (!_.contains(optionKeys, name)) {
          dfd.reject('Missing option to component ' + this.componentName + ': ' + name);
        }
      });
      dfd.resolve();
      return dfd.promise();
    });
  };
});
