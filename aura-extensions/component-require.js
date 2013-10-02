/*global define:true */
define(['underscore', 'jquery'], function(_, $) {
  "use strict";
  function nameToComponentPath (name, component) {
    return component.ref + '/' + name;
  }
  return function(app) {
    app.components.before('initialize', function() {
      var dfd = $.Deferred();
      if (this.require) {
        var paths = _.map(this.require, function(path) {
          return nameToComponentPath(path, this);
        }, this);
        require(paths, function(deps) {
          dfd.resolve(deps);
        }, function (err) {
          dfd.reject(err);
        });
        this.require = function (name) {
          return require(nameToComponentPath(name, this));
        };
        return dfd.promise();
      }
    });
  };
});
