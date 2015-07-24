Promise  = require('es6-promise').Promise
shimHTMLImports = require "../polyfills/shadow-css"
logger         = require './logger'

require "../polyfills/xhr-xdr" #TODO : Test if we can remove this now it's in Polyfill service
require "../utils/console-shim"

_ =  require "./lodash"
scriptLoader = require "./script-loader"

domain = "hull-polyfills.herokuapp.com"

polyfills =
  "WeakMap"                     : -> window.WeakMap?
  "Array.prototype.indexOf"     : -> Array.prototype.indexOf?
  "Array.prototype.map"         : -> Array.prototype.map?
  "Array.prototype.reduce"      : -> Array.prototype.reduce?
  "Array.prototype.some"        : -> Array.prototype.some?
  "Function.prototype.bind"     : -> Function.prototype.bind?
  "Object.keys"                 : -> Object.keys?
  "MutationObserver"            : -> window.MutationObserver?
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

toFill = _.keys _.pick polyfills, (tst)-> !tst()

fill = (config)->
  return new Promise (resolve, reject)->
    return resolve() unless toFill.length
    logger.verbose("Polyfilling", toFill.join(','))
    file = if (config.debug) then "polyfill.js" else "polyfill.js"
    url = "//#{domain}/v1/#{file}?features=#{toFill.join(",")}"
    return scriptLoader({ src:url, document:config.document}).then ()->
      shimHTMLImports(config.window)
      logger.verbose("Polyfilled", toFill.join(','))
      true
    .then(resolve, reject)


module.exports = 
  fill: fill
  domain: domain
