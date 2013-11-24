/* global define:true */
define(['underscore'], function (_) {
  "use strict";

  var extension = {
    initialize: function (app) {

      imageUrl = function(id, size, fallback) {
        if (size == null) {
          size = "small";
        }
        if (fallback == null) {
          fallback = "";
        }
        if (_.isFunction(id)) {
          id = id();
        }
        if (!id) {
          return fallback;
        }
        id = id.replace(/\/(large|small|medium|thumb)$/, '');

        if (!_.isString(size)) {
          size = 'small';
        }
        return "//" + app.config.assetsUrl + "/img/" + id + "/" + size;
      };

      app.sandbox.helpers = app.sandbox.helpers || {}
      app.sandbox.helpers.imageUrl =imageUrl;

    }
  };

  return extension;
});

