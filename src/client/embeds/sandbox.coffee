assign         = require '../../polyfills/assign'
_              = require '../../utils/lodash'
getIframeWindow= require '../../utils/get-iframe-window'
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
clone          = require '../../utils/clone'
SandboxedShare = require '../sharer/sandboxed-sharer'
StyleObserver  = require '../style/observer'
styleSandbox   = require '../style/sandbox'
throwErr       = require '../../utils/throw'

class Sandbox
  constructor : (deployment, scope, iframe)->
    @ship = deployment.ship
    @shipClassName = ".ship-#{@ship.id}"
    @scope = scope
    @deployment = deployment

    @callbacks = []
    @sandboxedShare =  new SandboxedShare({ share: Hull.share });

    sandboxedTrack = 

    @hull = assign({}, window.Hull, {
      onEmbed          : @onEmbed
      getDocument      : @getDocument
      getShipClassName : @getShipClassName
      track            : @sandboxedTrack
      share            : @sandboxedShare.share
      observe          : @observe
    });

    @booted = {}
    @booted.promise = new Promise (resolve, reject)=>
      @booted.resolve = resolve
      @booted.reject = reject

    @booted.promise.then =>
      @hull.track('hull.app.init')
    , throwErr

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
    return unless @scope
    @_getObserver().observe(target)

  scopeStyles : ()->
    return unless @scope
    @_observer.process(@_document)

  setDocument : (doc)->
    @_document = doc
    @observe(doc)

  getDocument : ()=>
    @_document

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
    return unless _.isFunction(callback)
    booted = @booted.promise.then (elements)=>
      callback(element, @deployment, @hull) for element in elements
    , throwErr
    booted.catch throwErr


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

      setSize : (size={})=>
        style = assign({},size)
        if size.width || size.height
          style.width = size.width if size.width?
          style.height = size.height if size.height?
          setStyle.style(iframe,style)
        else
          setStyle.autoSize(iframe)
        true

      setStyle : (style={})->
        setStyle.style(iframe,style)
        true

      ###*
       * autoSize method for sandboxed instances
       * @param  {Boolean|Int} interval a refresh interval or 'false'.
       *                                Interval : Autosize every xx milliseconds.
       *                                False    : Turns off autoUpdating immediately.
       *                                undefined: updates once, stops auto updating  
       * @return {Boolean} true to let ships detect if the method has an effect.
      ###
      autoSize : (interval)=>
        if (!isNaN(parseFloat(interval)))
          setInterval =>
            @hull.autoSize()
          , interval
        else
          clearInterval(@autoSizeInterval)
        setStyle.autoSize(iframe) unless interval==false
        true

      findUrl : ()-> findUrl(iframe)
    });

    @booted.promise.then =>
      @hull.autoSize()
    , throwErr

    w = getIframeWindow(iframe)
    # debugger
    # w.open = window.open
    # iframe.contentWindow = assign(iframe.contentWindow, window, {Hull:@hull})
    w.Hull = @hull

  get : ()-> @hull

module.exports = Sandbox
