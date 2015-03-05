"use strict";
/* global require, module */

var uuid    = require("./uuid");
var cookies = require("./cookies");

var createOrRefreshUuid = function(key, expires){
  var u = cookies.get(key) || uuid.uuid();
  cookies.set(key, u, { domain: document.location.host, expires: expires});
  return u;
};

module.exports = {
  // Create a Browser ID (10 year life span)
  getBrowserId: function(){
    var year = new Date().getFullYear() + 10;
    return createOrRefreshUuid("_bid", new Date(year, 0, 1));
  },

  //Create a session ID (short life span)
  getSessionId: function(){
    return createOrRefreshUuid("_sid", 30 * 60);
  }
};
