"use strict";
/*global module*/

// Private array of chars to use
var CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");

var uuid = function(len, radix) {
  var chars = CHARS, uu = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++){
      uu[i] = chars[0 | Math.random() * radix];
    }
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uu[8] = uu[13] = uu[18] = uu[23] = "-";
    uu[14] = "4";

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uu[i]) {
        r = 0 | Math.random() * 16;
        uu[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uu.join("");
};

// A more performant, but slightly bulkier, RFC4122v4 solution.  We boost performance
// by minimizing calls to random()
var uuidFast = function() {
  var chars = CHARS, uu = new Array(36), rnd = 0, r;
  for (var i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      uu[i] = "-";
    } else if (i === 14) {
      uu[i] = "4";
    } else {
      if (rnd <= 0x02) {
        rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
      }
      r = rnd & 0xf;
      rnd = rnd >> 4;
      uu[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
    }
  }
  return uu.join("");
};

// A more compact, but less performant, RFC4122v4 solution:
var uuidCompact = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
      v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

module.exports = {uuid, uuidFast, uuidCompact};
