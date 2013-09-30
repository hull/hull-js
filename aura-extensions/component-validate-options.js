define(['underscore', 'jquery'], function(_, $) {
  "use strict";
  var extension = {
    initialize: function (app) {
      app.components.before('initialize', extension.checkOptions);
    },
    checkOptions: function(options) {
      var dfd = $.Deferred();
      var optionKeys = _.keys(options);
      _.each(this.requiredOptions || [], function (name) {
        if (!_.contains(optionKeys, name)) {
          dfd.reject('Missing option to component ' + this.componentName + ': ' + name);
        }
      });
      dfd.resolve();
      return dfd.promise();
    }
  };
  return extension;
});
