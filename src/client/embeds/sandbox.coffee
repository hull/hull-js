SandboxedShare = require '../sharer/sandboxed-sharer'
getIframeWindow= require '../../utils/get-iframe-window'
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
assign         = require 'object-assign'
clone         = require '../../utils/clone'

module.exports = (ship, iframe)->

  sandboxedShare = new SandboxedShare({
    share:   Hull.share,
    domRoot: iframe
  })

  hull = assign({}, window.Hull, {
    ship         : clone(ship),
    track        : (name, event={})->
      event.ship_id = ship.id
      Hull.track(name, event)
    share        : sandboxedShare.share
  })

  if(iframe)
    hull = assign(hull, {
      setShipSize : (size={})=>
        style = assign({},size)
        style.width = size.width if size.width?
        style.height = size.height if size.height?
        setStyle.style(iframe,style)
        true

      setShipStyle : (style={})->
        setStyle.style(iframe,style)
        true

      autoSize : ()->
        setStyle.autoSize(iframe)
        true

      findUrl : ()-> findUrl(iframe)
    });

    w = getIframeWindow(iframe)
    w.location.hash = '/'
    w.Hull = hull

  hull
