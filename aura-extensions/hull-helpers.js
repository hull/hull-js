/* global define:true */
define(function () {
  "use strict";

  var extension = {
    initialize: function (app) {
      var _ = app.core.util._;
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

