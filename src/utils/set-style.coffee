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

module.exports = 
  autoSize : (iframe)->
    return unless iframe?
    target = iframe.contentDocument || iframe.contentWindow?.document
    # iframe.style.height = "10px" # reset to minimal height ...
    # IE opt. for bing/msn needs a bit added or scrollbar appears
    contentHeight = getDocHeight(target)
    if contentHeight != iframe.offsetHeight
      iframe.style.visibility = 'hidden'
      iframe.style.height = contentHeight + "px"
      iframe.style.visibility = 'visible'

  style : (el,style) ->
    if _.isObject(style)
      _.map style, (value,key)->
        setDimension(el,key,value)
