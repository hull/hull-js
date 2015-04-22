polyfill       = require '../../utils/load-polyfills'
sandbox        = require './sandbox'


class Iframe


  constructor: (opts={}, callback)->
    @src = opts.src
    @id = opts.id
    @iframe = @buildIframe()
    @hide() if opts.hidden
    @onIframeReady(@iframe, callback)


  hide : () ->
    @iframe.width                  = '1px'
    @iframe.height                 = '1px'
    @iframe.style.position         = "fixed";
    @iframe.style.width            = "1px";
    @iframe.style.height           = "1px";
    @iframe.style.top              = "-20px";
    @iframe.style.left             = "-20px";
    @iframe.style.overflow         = "hidden";
    @iframe.style.margin           = "0px";
    @iframe.style.padding          = "0px";
    @iframe.style.border           = "0px";

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

  getIframe: ()-> @iframe

  onIframeReady : (iframe, callback)=>
    doc = iframe.contentDocument
    if doc and doc.readyState=='complete'
      iframe.contentDocument.open();
      iframe.contentDocument.write "<!DOCTYPE html><html><head></head><body></body></html>"
      iframe.contentDocument.close();
      @sandboxIframe iframe, callback
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
    }).then ()=>
      callback(iframe)


module.exports = Iframe


