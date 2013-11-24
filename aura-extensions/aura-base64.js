/*global define:true */
define(['lib/utils/base64'],function(base64) {
  var extension = {
    name: "base64",
    // require: {
    //   paths: {
    //     base64:   'lib/utils/base64'
    //   }
    // },
    initialize: function(app){
      "use strict";
      app.core.util.base64 = base64
    }
  }
  return extension;
});
