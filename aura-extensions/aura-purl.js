define(function() {
  return {
    require: {
      paths: {
        purl: 'bower_components/purl/purl'
      }
    },
    initialize: function(app) {
      var purl = require('purl');
      app.core.util.purl = purl;
    }
  }
});