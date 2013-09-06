/*global define:true */
(function(){
  define(['moment'],{
    name: "Moment",
    initialize: function(app){
      "use strict";
      var moment = require('moment');
      var core = app.core, sandbox = app.sandbox;
      sandbox.util.moment = moment;
    }
  });
})();
