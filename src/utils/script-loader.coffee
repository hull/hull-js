_        = require './lodash'
promises = require './promises'

module.exports = (opts={})->
  doc = opts.document || window.document
  sc = document.createElement "script"
  dfd = promises.deferred();
  # Reject loading polyfills after 10 seconds, 

  errorTimeout = setTimeout ()->
    error = new Error("Couldn't load some parts of the libray \n(#{opts.src}).\nConnectivity issue?")
    console.error(error, error.message, error.stack)
    dfd.reject(error);
  , 10000

  if opts.attributes
    _.map opts.attributes, (value, key)-> sc.setAttribute(key, value)

  sc.id = opts.id if opts.id

  sc.onload = ()->
    clearTimeout errorTimeout
    dfd.resolve(sc)

  sc.src =  opts.src

  doc.getElementsByTagName('head')[0]?.appendChild(sc)

  dfd.promise
