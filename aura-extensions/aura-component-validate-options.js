/*global define:true*/
define(['underscore'], function(_) {
  "use strict";

  return function(app) {
    return {
      name: "ValidateOptions",
      initialize: function(app){
        "use strict";
        app.components.before('initialize', this.checkOptions);
      },
      checkOptions: function(options) {
        var dfd = app.core.data.deferred();
        var optionKeys = _.keys(options);
        _.each(this.requiredOptions || [], function (name) {
          if (!_.contains(optionKeys, name) || options[name] === undefined) {
            dfd.reject('Missing option to component ' + this.componentName + ': ' + name);
          }
        }, this);
        dfd.resolve();
        return dfd.promise;
      }
    }
  };

});
