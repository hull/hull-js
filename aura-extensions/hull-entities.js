/* global define:true */
define(['underscore', 'lib/utils/entity'], function (_, entity) {
  "use strict";

  parseQueryString = function(str) {
    var objURL;
    str || (str = window.location.search);
    objURL = {};
    str.replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), function($0, $1, $2, $3) {
      return objURL[$1] = decodeURIComponent($3);
    });
    return objURL;
  };

  var extension = {
    initialize: function (app) {
      app.core.util.entity = entity
      if (app.config.withEntity === true) {
        og = core.dom.find('meta[property="og:url"]');
        if (og && og.length && og.attr('content')) {
          uid = og.attr('content');
        } else {
          loc = document.location;
          search = parseQueryString(loc.search);
          qs = _.map(_.keys(search).sort(), function(k) {
            return [k, search[k]].join("=");
          }).join('&');
          if (qs.length > 0) {
            qs = "?" + qs;
          }
          uid = [loc.origin, loc.pathname, qs].join('');
        }
        app.config.uid = entity.encode(uid);
      }
    }
  };

  return extension;
});
