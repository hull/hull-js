Promise  = require './promises'
_        = require './lodash'
logger   = require './logger'

module.exports = (opts={})->
  doc = opts.document || window.document
  sc = document.createElement "script"
  new Promise (resolve, reject)->
    # Reject loading polyfills after 10 seconds,

    errorTimeout = setTimeout ()->
      error = new Error("Error loading #{opts.src}.\nConnectivity issue?")
      logger.error(error, error.message, error.stack)
      reject(error);
    , 60000

    if opts.attributes
      _.map opts.attributes, (value, key)-> sc.setAttribute(key, value)

    sc.id = opts.id if opts.id

    sc.src =  opts.src
    done = false

    # http://stackoverflow.com/questions/4845762/onload-handler-for-script-tag-in-internet-explorer
    sc.onload = sc.onreadystatechange = () ->
      if !done && (!@readyState || @readyState == "loaded" || @readyState == "complete")
        clearTimeout(errorTimeout)
        done = true;
        resolve(sc)
        # Handle memory leak in IE
        sc.onload = sc.onreadystatechange = null;

    doc.getElementsByTagName('head')[0]?.appendChild(sc)
