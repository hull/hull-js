define(['components/moment/moment'], {

  init: function(env) {
    // TODO: make it easier to inject multiple templating languages ?
    // cf. https://github.com/visionmedia/consolidate.js
    //var Handlebars = require('handlebars');
    env.core.template.hbs = function (tpl) {
      console.log(tpl, moment);
    };
  }
});
