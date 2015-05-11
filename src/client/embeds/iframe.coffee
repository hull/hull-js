polyfill       = require '../../utils/load-polyfills'
getIframe      = require '../../utils/get-iframe'
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
    doc = getIframe.document(iframe)
    if doc and doc.readyState=='complete'
      getIframe.window(iframe).location.href='/'
      doc.open();
      doc.write "<!DOCTYPE html><html><head></head><body></body></html>"
      doc.close();
      @polyfill(doc).then -> callback(iframe)
    else
      setTimeout ()=>
        @onIframeReady(iframe, callback)
      , 10

  # Build a sandbox for the current ship.
  # Will contain :
  # an enhanced version of Hull, with methods that resolve locally
  # - setShipSize
  # - getTargetUrl
  polyfill : (doc)->
    # Start resolving from the containing iframe up
    # TODO architecture could be better herer
    polyfill({
      document:doc,
      debug:Hull.config().debug
    })


module.exports = Iframe


