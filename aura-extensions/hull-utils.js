/*global define:true */
define(['underscore'], function(_) {
  return {
    require: {
      paths: {
        twitter_text:   'bower_components/twitter-text/twitter-text',
        moment:         'bower_components/moment/moment',
        string:         'bower_components/underscore.string/lib/underscore.string',
        cookie:         'bower_components/jquery.cookie/jquery.cookie',
        base64:         'bower_components/base64/base64',
        serializeJSON:  'bower_components/jquery.serializeJSON/jquery.serializeJSON'

      },
      shim: {
        string: { deps: ['underscore'] },
        cookie: { deps: ['jquery'] }
      }
    },
    initialize: function(app) {
      "use strict";
      app.core.util.base64 = {
        decode: function(input, urlsafe) {
          if (urlsafe) {
            input = input.replace(/\+/g, '-').replace(/\//g, '_');
          }
          return window.atob(input);
        },
        encode: function(input, urlsafe) {
          var ret = window.btoa(input);
          if (urlsafe) {
            ret = ret.replace(/\+/g, '-').replace(/\//g, '_');
          }
          return ret;
        }
      };

      app.core.dom.getFormData = function(form) {
        return app.core.dom.find(form).serializeJSON();
      };
    }
  }
});
