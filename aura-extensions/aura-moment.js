/*global define:true */
define(['bower_components/moment/moment'], function(moment) {
  return {
    initialize: function(app){
      "use strict";
      app.sandbox.util.moment = moment;
    }
  };
});
