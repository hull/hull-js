assign         = require '../../polyfills/assign'
_              = require '../../utils/lodash'
getIframe      = require '../../utils/get-iframe'
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
    @_scopes = []

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
    opts.params = assign({}, opts.params, { ship_id: @ship.id })
    Hull.share(opts, event)

  getShipClassName : => @shipClassName

  getObserver : =>
    @observer ||= new StyleObserver(@shipClassName)
    @observer

  observe : (target)->
    return unless @scopeStyle
    @getObserver().observe(target)

  process : (target)->
    return unless @scopeStyle and target
    @getObserver().process(target)

  unobserve : (target)->
    return unless @scopeStyle
    @getObserver().unobserve(target)

  scope : (insertion)->
    iframe = insertion.iframe

    return @ unless iframe?.contentDocument

    sandbox = Object.create(@)
    @_scopes.push sandbox

    doc = iframe.contentDocument
    # sandbox.observe(doc)
    # sandbox.addElement(insertion.el)

    sandbox.autoSizeInterval = null;
    mainShare = @share
    hull = assign({}, @hull, {
      onEmbed : (args...)=>
        callback = args.shift() while (args.length>0 && !_.isFunction(callback))
        return unless callback
        insertion.callbacks.push callback
        @deployment.onEmbed()
      getDocument : ()=> doc
      share : (opts, event={})->
        event = assign(event, {target: iframe})
        mainShare(opts,event);
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

    sandbox.hull = hull
    # Default : autosize every 300ms.
    # Can be prevented in Ship by calling hull.autoSize(false) or hull.autoSize()
    sandbox.hull.autoSize(300)
    w = getIframe.window(iframe)
    w.Hull = sandbox.hull
    sandbox

  setDocument : (doc)->
    return unless doc?
    @_document = doc
    @observe(doc)
    @process(@_document)

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
    for scope in @_scopes
      scope.hull.autoSize(false)
    @_scopes = []
    @getObserver().destroy()

module.exports = Sandbox
