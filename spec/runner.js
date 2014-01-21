var allTestFiles = [];
Object.keys(window.__karma__.files).forEach(function(file) {
  if (/_spec\.js$/.test(file) && (/^\/base\/spec/).test(file) && file.indexOf('bootstrap') === -1) {
    allTestFiles.push(file);
  }
});

//FIXME, this is from src/utils/base64.coffee
mocha.globals(['atob', 'btoa']);

window.console = {
  log: function () {},
  warn: function () {},
  error: function () {},
};

require.config({
  baseUrl: '/base/',
  paths: {
    "aura": 'bower_components/aura/lib',
    "aura-extensions": 'aura-extensions',
    underscore: 'bower_components/underscore/underscore-min',
    promises: 'bower_components/q/q',
    eventemitter: 'bower_components/eventemitter2/lib/eventemitter2',
    squire: 'bower_components/squire/src/Squire',
    jquery: 'bower_components/jquery/jquery.min',
    handlebars: 'bower_components/handlebars/handlebars.amd',
    backbone: 'bower_components/backbone/backbone-min',
    fixtures: 'spec/fixtures',
    string: 'bower_components/underscore.string/lib/underscore.string',
    moment: 'bower_components/moment/moment',
    text: 'bower_components/requirejs-text/text'
  },
  shim: {
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone"
    }
  }
});

require(allTestFiles, function () {
  window.__karma__.start();
});
