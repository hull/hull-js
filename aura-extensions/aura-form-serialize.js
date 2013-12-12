/*global define:true */
define(['bower_components/form2js/src/form2js', 'underscore'], function (form2js, _) {
  "use strict";
  return {
    initialize: function(app){
      app.core.dom.getFormData = function(form){
        if (form.toArray)  {
          form = form.toArray();
        }
        return _.extend.apply(_, _.map([].concat(form), form2js));
      };
    }
  };
});
