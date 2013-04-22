/* global define: true */
define(function() {
  "use strict";
  return {
    reset: function (mod, cb) {
      return function (done) {
        require.undef(mod);
        require([mod], function (module) {
          cb(module);
          done();
        });
      };
    }
  };
});
