/*global define:true*/
define(function() {
  "use strict";

  return function(app) {
    var _ = app.core.util._;

    var module = {
      name: "ValidateOptions",
      initialize: function(app){
        app.components.before('initialize', module.checkOptions);
      },
      checkOptions: function(options) {
        var optionKeys = _.keys(options);
        _.each(this.requiredOptions || [], function (name) {
          if (!_.contains(optionKeys, name) || options[name] === undefined) {
            throw new Error ('Missing option to component ' + this.componentName + ': ' + name);
          }
        }, this);
        return true;
      }
    };
    return module;
  };

});
