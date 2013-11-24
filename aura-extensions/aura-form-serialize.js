/*global define:true */
define(function() {

  var extension = {
    require:{
      paths:{
        form2js: 'bower_components/form2js/src/form2js'
      }
    },

    initialize: function(app){
      var getFormData = function(form){
        form2js(core.dom.find(form));
      };
      app.core.dom.getFormData = getFormData
    }
  }

  return extension;
});
