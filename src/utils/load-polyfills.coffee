require "es6-promise"
require "../polyfills/xhr-xdr"
shimHTMLImports = require "../polyfills/shadow-css"
require "../utils/console-shim"

_ =  require "./lodash"
scriptLoader = require "./script-loader"


polyfills =
  "WeakMap"                     : -> window.WeakMap?
  "Array.prototype.indexOf"     : -> Array.prototype.indexOf?
  "Array.prototype.map"         : -> Array.prototype.map?
  "Array.prototype.reduce"      : -> Array.prototype.reduce?
  "Array.prototype.some"        : -> Array.prototype.some?
  "Function.prototype.bind"     : -> Function.prototype.bind?
  "Object.keys"                 : -> Object.keys?
  "Object.defineProperty"       : -> Object.defineProperty?
  "HTMLImports"                 : -> document.createElement("link").import?
  "Element.prototype.classList" : -> document.documentElement.classList
  "Xdomain"                     : -> 
    return true if new window.XMLHttpRequest().withCredentials?
    return true if window.XMLHttpRequest.supportsXDR == true
    false
  "Event"                       : -> 
    return false unless global.Event?
    return true if typeof global.Event == "function"
    try
      new Event("click")
      return true
    catch e 
      return false


allGood = _.every polyfills, (tst)-> !!tst()

module.exports = (config)->
  return new Promise (resolve, reject)->
    return resolve() if allGood
    file = if (config.debug) then "polyfill.js" else "polyfill.js"
    url = "//polyfills.ngrok.com/v1/#{file}?features=#{_.keys(polyfills).join(",")}"
    return scriptLoader({ src:url, document:config.document}).then(shimHTMLImports).then(resolve, reject)