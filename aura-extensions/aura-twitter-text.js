/*global define:true */
(function(){
  define(['twitter_text'],{
    name: "twttr",
    initialize: function(app){
      "use strict";
      require('twitter_text');
      var core = app.core, sandbox = app.sandbox;
      sandbox.util.twttr = window.twttr.txt;
    }
  });
})();
