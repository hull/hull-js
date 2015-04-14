polyfill       = require '../../utils/load-polyfills'
sandbox        = require './sandbox'


class Iframe


  constructor: (opts={}, callback)->
    return false unless opts.target
    @target = opts.target
    @ship = opts.ship
    @src = opts.src
    @id = opts.id
    @iframe = @buildIframe()
    @onIframeReady(@iframe, callback)


  buildIframe : (target, src)->
    @iframe = document.createElement 'iframe'
    @iframe.name                   = "ship_#{@id}"
    @iframe.src                    = src if src?
    @iframe.vspace                 = 0
    @iframe.hspace                 = 0
    @iframe.marginWidth            = 0
    @iframe.marginHeight           = 0
    @iframe.scrolling              = 'no'
    @iframe.border                 = 0
    @iframe.frameBorder            = 0
    @iframe

  getIframe: ()->
    @iframe

  onIframeReady : (iframe, callback)=>
    doc = iframe.contentDocument
    if doc and doc.readyState=='complete'
      @sandboxIframe iframe, =>
        callback(@iframe)
    else
      setTimeout ()=>
        @onIframeReady(iframe, callback)
      , 10

  # Build a sandbox for the current ship.
  # Will contain :
  # an enhanced version of Hull, with methods that resolve locally
  # - setShipSize
  # - getTargetUrl
  sandboxIframe : (iframe, callback)->
    # Start resolving from the containing iframe up
    # TODO architecture could be better herer

    polyfill({
      document:iframe.contentDocument,
      debug:Hull.config().debug
    }).then ()=> callback(@iframe)


module.exports = Iframe
