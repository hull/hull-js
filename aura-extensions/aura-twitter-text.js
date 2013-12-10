/*global define:true, require:true */
define(['bower_components/twitter-text/twitter-text'], function (){
  return {
    initialize: function(app){
      "use strict";
      app.sandbox.util.twttr = window.twttr.txt;
    }
  };
});
