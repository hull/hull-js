assign         = require '../../polyfills/assign'
_              = require '../../utils/lodash'
getIframeWindow= require '../../utils/get-iframe-window'
findUrl        = require '../../utils/find-url'
setStyle       = require '../../utils/set-style'
clone          = require '../../utils/clone'
StyleObserver  = require '../style/observer'
throwErr       = require '../../utils/throw'

class Sandbox
  constructor : (deployment, scopeStyle)->
    @ship = deployment.ship
    @shipClassName = ".ship-#{@ship.id}"
    @scopeStyle = scopeStyle
    @deployment = deployment

    @callbacks = []
    @scopes = []

    @hull = assign({}, window.Hull, {
      getDocument      : @getDocument
      getShipClassName : @getShipClassName
      track            : @track
      share            : @share
    });

  ###*
   * Performs a track that has the `ship_id` field set correctly
   * @param  {[type]} name       [description]
   * @param  {[type]} event={} [description]
   * @return {[type]}            [description]
  ###
  track : (name, event={})=>
    event.ship_id = @ship.id
    Hull.track(name, event)

  share: (opts={}, event={})=>

    event = assign({}, event, {hull_ship_id: @ship.id})

    # We place a fallback for the sharing target event
    # and pass in the iframe.
    # This way the Hull.share method will walk from the iframe container up.
    event = assign(event, {target: @iframe}) if @iframe?

    # Enrich UTM Tags Defaults
    opts.tags = assign({}, opts.tags, {utm_campaign:@ship.name})

    @hull.share(opts,event)

  getShipClassName : => @shipClassName

  getObserver : =>
    @observer ||= new StyleObserver(@shipClassName)
    @observer

  observe : (target)->
    return unless @scopeStyle
    @getObserver().observe(target)

  process : (target)->
    return unless @scopeStyle
    @getObserver().process(target)

  unobserve : (target)->
    return unless @scopeStyle
    @getObserver().unobserve(target)

  scope : (iframe)->
    return @ unless iframe?.contentDocument
    @iframe = iframe

    sandbox = Object.create(@)
    @scopes.push sandbox
    sandbox.observe(iframe.contentDocument)
    sandbox.autoSizeInterval = null;
    sandbox.hull = assign(@hull, {
      findUrl : ()-> findUrl(iframe)
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
            sandbox.hull.autoSize()
          , interval
        else
          clearInterval(sandbox.autoSizeInterval)
        setStyle.autoSize(iframe) unless interval==false
        true
    });

    sandbox.hull.autoSize()

    w = getIframeWindow(iframe)
    w.Hull = sandbox.hull
    sandbox

  scopeStyles : ()->
    @process(@_document)

  setDocument : (doc)->
    return unless doc?
    @_document = doc
    @observe(doc)

  getDocument : ()=>
    @_document

  ###*
   * Adds an element to the array of elements owned by the sandbox.
   * Monitors it for Style Tags so they can be autoprefixed
   * @param {Node} element DOM Node
  ###
  addElement: (element)->
    @observe(element) if element

  removeElement: (element)->
    @unobserve(element) if element

  get : ()-> @hull

  destroy: ()=>
    scope.destroy() for scope in @scopes
    @getObserver().destroy()

module.exports = Sandbox
