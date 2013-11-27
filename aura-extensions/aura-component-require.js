/*global define:true */
define(['underscore'], function(_) {
  "use strict";
  function nameToComponentPath (name, component) {
    return component.ref + '/' + name;
  }
  return function(app) {
    return {
      initialize: function(){
        app.components.before('initialize', this.componentRequire);
      },
      componentRequire: function(){
        var dfd = app.core.data.deferred();
        if (this.require) {
          var paths = _.map(this.require, function(path) {
            return nameToComponentPath(path, this);
          }, this);
          var config = require.s.contexts._.config;
          var defined = require.s.contexts._.defined;
          var localRequire = require.config({
            context: '__context__' + this.ref,
            baseUrl: config.pkgs[this.ref].location,
            shim: config.shim,
            paths: config.paths
          });
          var component = this;
          var componentRequire = this.require;
          localRequire(['require'], function (require) {
            _.each(_.keys(defined), function (name) {
              define(name, [], function () { return defined[name]; });
            });
            require(componentRequire, function(deps) {
              component.require = function (name) {
                return localRequire(name);
              };
              dfd.resolve(deps);
            }, function (err) {
              dfd.reject(err);
            });
          });
          return dfd.promise;
        }
      }
    }
  };
});
