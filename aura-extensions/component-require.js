define(['underscore', 'jquery'], function(_, $) {
  return function(app) {
    app.components.before('initialize', function() {
      "use strict";
      if (this.require && this.require.paths) {
        var dfd = $.Deferred();
        var requireConfig = this.require;
        var localRequire = require.config(_.extend(requireConfig, {
          context: 'context-' + this.ref,
          baseUrl: this.options.require.packages[0].location
        }));
        localRequire(_.keys(this.require.paths), function(deps) {
          dfd.resolve();
        }, function (err) {
          dfd.reject(err);
        });
        this.require = localRequire;
        return dfd;
      }
    });
  };
});
