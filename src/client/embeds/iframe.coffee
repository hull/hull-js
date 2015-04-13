SandboxedShare = require '../sharer/sandboxed-sharer';
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
assign         = require 'object-assign'
polyfill       = require '../../utils/load-polyfills'

class Iframe


  constructor: (opts={}, callback)->
    return false unless opts.target
    @target = opts.target
    @ship = opts.ship
    @src = opts.src
    @frame = @buildIframe()
    @onIframeReady(@frame, callback)


  buildIframe : (target, src)->
    @frame = document.createElement 'iframe'
    @frame.src                    = src if src?
    @frame.vspace                 = 0
    @frame.hspace                 = 0
    @frame.marginWidth            = 0
    @frame.marginHeight           = 0
    @frame.scrolling              = 'no'
    @frame.border                 = 0
    @frame.frameBorder            = 0
    @frame

  getIframe: ()->
    @frame

  onIframeReady : (frame, callback)=>
    doc = frame.contentDocument
    if doc and doc.readyState=='complete'
      @prepareIframeSandbox frame, =>
        callback(@frame)
    else
      setTimeout ()=>
        @onIframeReady(frame, callback)
      , 10

  # Build a sandbox for the current ship.
  # Will contain :
  # an enhanced version of Hull, with methods that resolve locally
  # - setShipSize
  # - getTargetUrl
  prepareIframeSandbox : (frame, callback)->
    w = frame.contentWindow

    # Start resolving from the containing iframe up
    # TODO architecture could be better herer
    sandboxedShare = new SandboxedShare({
      share: Hull.share,
      ship: @ship,
      domRoot: frame
    })
    setShipSize = (size={})=>
      style = assign({},size)
      style.width = size.width if size.width?
      style.height = size.height if size.height?
      setStyle.style(frame,style)
      true
    setShipStyle = (style={})->
      setStyle.style(frame,style)
      true
    findUrl = ()-> findUrl(frame)

    polyfill({document:w.document, debug:Hull.config().debug}).then ()=>
      w.location.hash = '/'
      w.Hull = assign({}, window.Hull, {
        setShipSize  : setShipSize
        setShipStyle : setShipStyle
        share        : sandboxedShare.share
        findUrl      : findUrl
      });
      callback(@frame)


module.exports = Iframe
