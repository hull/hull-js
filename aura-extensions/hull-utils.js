/*global define:true */
define(function() {

  return {
    require: {
      paths: {
        string: 'bower_components/underscore.string/lib/underscore.string',
      },
      shim: {
        string: { deps: ['underscore'] }
      }
    },
    initialize: function(app) {
      "use strict";
      var _ = app.core.util._;
      app.sandbox.utils = app.sandbox.utils || {}
    }
  }
});
