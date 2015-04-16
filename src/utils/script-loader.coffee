_        = require './lodash'

module.exports = (opts={},callback)->
  doc = opts.document || window.document
  sc = document.createElement "script"

  if opts.attributes
    _.map opts.attributes, (value, key)-> sc.setAttribute(key, value)

  sc.id = opts.id if opts.id
  sc.onload = callback
  sc.src =  opts.src
  doc.getElementsByTagName('head')[0]?.appendChild(sc)
  sc
