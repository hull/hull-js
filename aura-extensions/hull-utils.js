/*global define:true */
define(['underscore'], function(_) {

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
      app.sandbox.utils = app.sandbox.utils || {}
    }
  }
});
