/*global define:true */
define(['handlebars'], function (Handlebars) {
  return {
    initialize: function(app) {
      "use strict";
      // TODO: make it easier to inject multiple templating languages ?
      // cf. https://github.com/visionmedia/consolidate.js
      app.core.template.hbs = function(tpl) {
        if (typeof tpl === "function") return Handlebars.template(tpl);
        return Handlebars.compile(tpl);
      };
      app.core.template.handlebars = Handlebars;
    }
  };
});
