/*global define:true */
define(['moment'], function(moment) {
  return {
    initialize: function(app){
      "use strict";
      app.sandbox.util.moment = moment;
    }
  };
});
