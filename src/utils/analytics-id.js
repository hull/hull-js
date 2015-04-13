"use strict";
/* global require, module */

var uuid    = require("./uuid");
var cookies = require("./cookies");
var Fingerprint = require("fingerprintjs");

var createOrRefreshUuid = function(key, options) {
  var val = cookies.get(key) || options.getValue();
  cookies.set(key, val, {
    domain: (options.domain || document.location.host),
    expires: options.expires
  });
  return val;
};

module.exports = {
  // Create a Browser ID (10 year life span)
  getBrowserId: function() {
    var year = new Date().getFullYear() + 10;

    return createOrRefreshUuid("_bid", {
      getValue: function() {
        return new Fingerprint({ canvas: true }).get();
      },
      expires: new Date(year, 0, 1)
    });
  },

  //Create a session ID (short life span)
  getSessionId: function() {
    return createOrRefreshUuid("_sid", {
      getValue: function() {
        return uuid.uuid();
      },
      expires: 30 * 60
    });
  }
};
