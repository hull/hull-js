define(['underscore', 'jquery'], function(_, $) {
  return function(app) {
    debugger
    app.components.before('initialize', function() {
      debugger
      if (this.require && this.require.paths) {
        var dfd = $.when();
        var requireConfig = this.require;
        var localRequire = require.config({
          context: 'context-' + this.ref,
          baseUrl: this.options.require.packages[0].location
        });
        localRequire.config(requireConfig);
        localRequire.require(_.keys(this.require.paths), function(deps) {
          dfd.resolve(deps);
        }, dfd.reject());
        debugger
        this.require = localRequire;
        return dfd;
      }
    });
  };
});
