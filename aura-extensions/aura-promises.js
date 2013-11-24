/*global define:true*/
define(['lib/utils/promises'],function(promise) {
  "use strict";
  var module = {
    name: "Promise",
    // require: {
    //   paths: {
    //     promise: ''
    //   }
    // },
    initialize: function (app) {
      app.core.promise = promise;
    }
  };
  return module;
});
