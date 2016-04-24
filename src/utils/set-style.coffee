_ = require '../utils/lodash'


getDocHeight = (doc)->
  return unless doc
  body = doc.body
  html = doc.documentElement
  Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

setDimension = (el, dim, val)->
  if val?
    val = "#{val}px" if /[0-9]+$/.test(val.toString())
    el.style[dim] = val

module.exports = (el,style) ->
  return unless _.isObject(style)
  _.map style, (value,key)-> setDimension(el,key,value)
