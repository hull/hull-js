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
  "URL"                         : -> 
    try
      if window.URL
        nativeURL = new window.URL('http://example.com')
        return true if nativeURL.href?
      return false
    catch e
      return false
  "HTMLImports"                 : ->
    link = document.createElement("link")
    link['import']!=undefined
  "Element.prototype.classList" : -> document.documentElement.classList?
  "Element.prototype.cloneNode" : -> 
    test = ()->
      test = document.createElement('input')
      test.checked = true
      result = test.cloneNode()
      !!result.checked
    this.document? && document.documentElement.cloneNode? && test()
  "Xdomain"                     : -> 
    xhr = new window.XMLHttpRequest()
    return true if xhr.withCredentials?
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
    file = if (config.debug) then "polyfill.js" else "polyfill.min.js"
    url = "//hull-polyfills.herokuapp.com/v1/#{file}?features=#{_.keys(polyfills).join(",")}"
    return scriptLoader({ src:url, document:config.document}).then(shimHTMLImports).then(resolve, reject)

