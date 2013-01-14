define({
  name: 'The Handle of the Bars',
  config: {
    require: {
      paths:  { handlebars: 'handlebars/handlebars' },
      shim:   { handlebars: { exports: 'Handlebars' } }
    }
  },

  init: function(env) {
    // TODO: make it easier to inject multiple templating languages ?
    // cf. https://github.com/visionmedia/consolidate.js
    var Handlebars = require('handlebars');
    env.core.template.hbs = function(tpl) {
      if (typeof tpl === "function") return tpl;
      return Handlebars.compile(tpl);
    };
  }
});
