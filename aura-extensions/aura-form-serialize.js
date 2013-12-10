/*global define:true */
define(['bower_components/form2js/src/form2js'], function (form2js) {
  "use strict";
  return {
    initialize: function(app){
      app.core.dom.getFormData = function(form){
        form2js(app.core.dom.find(form));
      };
    }
  };
});
