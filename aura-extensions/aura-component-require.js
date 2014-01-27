/*global define:true */
define(['underscore', 'lib/utils/promises', 'lib/utils/q2jquery'], function(_, promises, q2jquery) {
  "use strict";

  function nameToComponentPath (name, component) {
    return component.ref + '/' + name;
  }

  function componentRequire () {
    var dfd = promises.deferred();
    if (!this.require) { return; }

    var paths = _.map([].concat(this.require), function(path) {
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
    var required = this.require;
    localRequire(['require'], function (require) {
      _.each(_.keys(defined), function (name) {
        define(name, [], function () { return defined[name]; });
      });
      require(required, function(deps) {
        component.require = function (name) {
          return localRequire(name);
        };
        dfd.resolve(deps);
      }, function (err) {
        dfd.reject(err);
      });
    });
    return q2jquery(dfd.promise);
  }

  return {
    initialize: function(app) {
      app.components.before('initialize', componentRequire);
    },
    componentRequire: componentRequire
  };
});
