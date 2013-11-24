/*global define:true */
define(function() {
  var extension = {
    name: "Moment",
    require: {
      paths: {
        moment: '/bower_components/moment/moment'
      }
    },
    initialize: function(app){
      "use strict";
      app.sandbox.util.moment = moment;
    }
  }
  return extension;
});
