/*global define:true */
define(function() {
  var extension = {
    name: "twttr",
    require: {
      paths: {
        twitter_text:   '/bower_components/twitter-text/twitter-text'
      }
    },
    initialize: function(app){
      "use strict";
      app.sandbox.util.twttr = window.twttr.txt;
    }
  }
  return extension;
});
