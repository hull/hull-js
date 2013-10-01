/* global define:true */
define(['underscore'], function (_) {
  "use strict";
  var extension = {
    initialize: function (app) {
      app.components.before('initialize', function (options) {
        var normalizedOptions = extension.normalizeId.call(this, options);
        this.options = _.extend(this.options, normalizedOptions);
      });
    },
    normalizeId: function (options) {
      var sandbox = this.sandbox;
      if (options.id) {
        return options;
      }
      if (options.uid) {
        options.id = sandbox.util.entity.encode(options.uid);
        return options;
      }
      options.id = sandbox.config.entity_id;
      return options;
    }
  };

  return extension;
});
