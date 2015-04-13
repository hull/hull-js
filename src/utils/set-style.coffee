_ = require '../utils/lodash'

setDimension = (el, dim, val)->
  if val?
    val = "#{val}px" if /[0-9]+$/.test(val.toString())
    el.style[dim] = val

module.exports = 
  style : (el,style) ->
    if _.isObject(style)
      _.map style, (value,key)->
        setDimension(el,key,value)
