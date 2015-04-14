_        = require './lodash'

module.exports = (opts={},callback)->
  document = opts.document || window.document
  sc = document.createElement "script"

  if opts.attributes
    _.map opts.attributes, (value, key)-> sc.setAttribute(key, value)

  sc.id = opts.id if opts.id
  sc.onload = callback
  sc.src =  opts.src
  document.getElementsByTagName("head")[0].appendChild(sc)
  sc
