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
  constructor : (deployment, scopeStyle, iframe)->
    @ship = deployment.ship
    @shipClassName = ".ship-#{@ship.id}"
    @scopeStyle = scopeStyle
    @deployment = deployment

    @callbacks = []
    @sandboxedShare =  new SandboxedShare({ share: Hull.share });

    sandboxedTrack = 

    @hull = assign({}, window.Hull, {
      onEmbed        : @onEmbed
      track          : @sandboxedTrack
      share          : @sandboxedShare.share
      shipClassName  : @getShipClassName 
      observe        : @observe
    });

    @booted = {}
    @booted.promise = new Promise (resolve, reject)=>
      @booted.resolve = resolve
      @booted.reject = reject

    @booted.promise.then => @hull.track('hull.app.init')

    @setContainer(iframe) if !!iframe

  boot: (elements)=> @booted.resolve(elements)

  ###*
   * Performs a track that has the `ship_id` field set correctly
   * @param  {[type]} name       [description]
   * @param  {[type]} event={} [description]
   * @return {[type]}            [description]
  ###
  sandboxedTrack : (name, event={})=>
    event.ship_id = @ship.id
    Hull.track(name, event)

  getShipClassName : => @shipClassName

  _getObserver : =>
    @_observer ||= new StyleObserver(@shipClassName)
    @_observer

  observe : (target)->
    return unless @scopeStyle
    @_getObserver().observe(target)

  scopeStyles : ()->
    return unless @scopeStyle
    @_observer.process(@_document)

  setDocument : (doc)->
    @_document = doc
    @observe(doc)

  ###*
   * Adds an element to the array of elements owned by the sandbox.
   * Monitors it for Style Tags so they can be autoprefixed
   * @param {Node} element DOM Node
  ###
  addElement: (element)-> @observe(element) if element

  ###*
   * Add a Callback to the callback queue.
   * Tries to perform it immediately
   * The right signature is onEmbed(fn) so remove the eventual `doc` that can be there (legacy)
   * @param {function} fn callback to add
   * @return {[type]}  [description]
  ###
  onEmbed: (args...)=>
    args.shift() if args.length == 2
    callback = args[0]
    @booted.promise.then (elements)=>
      callback(element, @deployment, @hull) for element in elements

  setContainer : (iframe)->
    @_container = iframe.contentDocument || document

    return @hull unless iframe

    @observe(@_container)

    @sandboxedShare.setContainer(iframe)
    @autoSizeInterval = null;

    @hull = assign(@hull, {

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
          setInterval =>
            @hull.autoSize()
          , interval
        else
          clearInterval(@autoSizeInterval) if interval==false
        setStyle.autoSize(iframe) unless interval==false
        true

      findUrl : ()-> findUrl(iframe)
    });

    @booted.promise.then =>
      @hull.autoSize()

    w = getIframeWindow(iframe)
    # debugger
    # w.open = window.open
    iframe.contentWindow = assign(iframe.contentWindow, window, {Hull:@hull})
    # w.Hull = @hull

  get : ()-> @hull

module.exports = Sandbox
