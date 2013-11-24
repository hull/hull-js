/*global define:true */
//@TODO This extension should mostly be useless now. Remove it ?
define({
  require: {
    paths:  { handlebars: 'components/handlebars/handlebars' },
    shim:   { handlebars: { exports: 'Handlebars' } }
  },

  initialize: function(app) {
    "use strict";
    // TODO: make it easier to inject multiple templating languages ?
    // cf. https://github.com/visionmedia/consolidate.js
    var Handlebars = require('handlebars');
    app.core.template.hbs = function(tpl) {
      if (typeof tpl === "function") return Handlebars.template(tpl);
      return Handlebars.compile(tpl);
    };
    app.core.template.handlebars = Handlebars
  }
});
