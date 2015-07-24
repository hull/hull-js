"use strict";
/* global require, module */

var CoffeeScript = require("coffee-script");
var Babel = require("../node_modules/babel-jest");

module.exports = {
  process: function(src, path) {
    if (CoffeeScript.helpers.isCoffee(path)) {
      return CoffeeScript.compile(src, {"bare": true});
    } else {
      return Babel.process(src, path);
    }
  }
};
