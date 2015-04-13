"use strict";
/*global import, module*/
import _            from "./lodash";
import scriptLoader from "./script-loader";
import promises     from './promises'

// Hardcoded Polyfills
require("../polyfills/xhr-xdr");

var polyfills = {
  "WeakMap"                  : function(){ return typeof WeakMap !== "undefined";  },
  "Array.prototype.indexOf"  : function(){ return "indexOf" in Array.prototype;    },
  "Array.prototype.map"      : function(){ return "map"     in Array.prototype;    },
  "Array.prototype.reduce"   : function(){ return "reduce"  in Array.prototype;    },
  "Array.prototype.some"     : function(){ return "some"    in Array.prototype;    },
  "Function.prototype.bind"  : function(){ return "bind"    in Function.prototype; },
  "Object.keys"              : function(){ return "keys"    in Object;             },
  "HTMLImports"              : function(){ return "import" in document.createElement("link");},
  "Object.defineProperty"    : function(){
    if (Object.defineProperty){ return true;}
    return false;
  },
  "Event"                    : function(){
    if (!("Event" in global)){ return false; }
    if (typeof global.Event === "function"){ return true; }

    try{
      new Event("click");
      return true;
    } catch(e){
      return false;
    }
  }
};

var allGood = _.every(polyfills, function(tst){ return !!tst(); });

module.exports = function(config){
  var dfd = promises.deferred();
  if(allGood){
    dfd.resolve();
  } else{
    var file = (config.debug)?"polyfill.min.js":"polyfill.js";
    // Reject loading polyfills after 10 seconds, 
    var errorTimeout = setTimeout(function(){
      var error = new Error("Couldn't load some parts of the libray (polyfills). Probably a connectivity issue")
      console.error(error);
      dfd.reject(error);
    }, 10000);
    scriptLoader({
      src:`//localhost:3000/v1/${file}?features=${_.keys(polyfills).join(",")}`,
      document:config.document
    }, function(){
      clearTimeout(errorTimeout);
      dfd.resolve();
    });
  }
  return dfd.promise;
  // scriptLoader('//cdn.polyfill.io/v1/polyfill.min.js?#{_.keys(polyfills).join(,)}', callback)
};
