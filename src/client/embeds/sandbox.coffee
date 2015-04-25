assign         = require '../../polyfills/assign'
_              = require '../../utils/lodash'
getIframeWindow= require '../../utils/get-iframe-window'
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
clone          = require '../../utils/clone'
SandboxedShare = require '../sharer/sandboxed-sharer'
StyleObserver  = require '../style/observer'
styleSandbox   = require '../style/sandbox'

class Sandbox
  constructor : (ship, deployment, scopeStyles, iframe)->
    @ship = ship
    @shipClassName = ".ship-#{@ship.id}"
    @scopeStyles = scopeStyles
    @deployment = deployment

    @callbacks = []
    @elements  = []
    @_sandboxedShare =  new SandboxedShare({ share: Hull.share });

    sandboxedTrack = 

    @_hull = assign({}, window.Hull, {
      onEmbed        : @onEmbed
      track          : @sandboxedTrack
      share          : @_sandboxedShare.share
      shipClassName  : @getShipClassName 
      watchNode      : @watchNode
      watchDocument  : @watchDocument
    });

    @setContainer(iframe) if iframe

  sandboxedTrack : (name, event={})=>
    event.ship_id = @ship.id
    Hull.track(name, event)

  getShipClassName : ()=> @shipClassName

  _getWatcher : ()=>
    @_styleObserver ||= new StyleObserver(@shipClassName)
    @_styleObserver
  watchNode:     (node)=> @_getWatcher().observeNode(node) if @scopeStyles
  watchDocument: (container)=> @_getWatcher().observeDocument(container) if @scopeStyles

  addElement: (element)->
    if element
      @watchNode(element)
      @elements.push(element)

  onEmbed: (args...)=>
    args.shift() if args.length == 2
    callback = args[0]
    @boot(callback)
    @callbacks.push(callback)
    true

  boot: (callback)=>
    # Only perform boot if we have both Elements and Callbacks
    _.map @elements, (element)=>
      @_hull.track('hull.app.init')
      if callback
        callback(element, @deployment, @_hull)
      else
        _.map @callbacks, (callback)=> callback(element, @deployment, @_hull)
      @_hull.autoSize()

  setContainer : (iframe)->
    @_container = iframe.contentDocument || document

    return @_hull unless iframe

    @watchDocument(@_container)

    @_sandboxedShare.setContainer(iframe)
    @_autoSizeInterval = null;

    @_hull = assign(@_hull, {

      # onEmbed : (args...)->
      #   args.shift() if args.length == 2
      #   Hull.onEmbed(iframe.contentDocument, args...)
      #   true

      setShipSize : (size={})=>
        style = assign({},size)
        style.width = size.width if size.width?
        style.height = size.height if size.height?
        setStyle.style(iframe,style)
        true

      setShipStyle : (style={})->
        setStyle.style(iframe,style)
        true

      autoSize : (interval)=>
        if (interval)
          setInterval ()=>
            @_hull.autoSize()
          , interval
        else
          clearInterval(@_autoSizeInterval) if interval==false
        setStyle.autoSize(iframe) unless interval==false
        true

      findUrl : ()-> findUrl(iframe)
    });

    w = getIframeWindow(iframe)
    w.Hull = @_hull

  get : ()-> @_hull

module.exports = Sandbox
