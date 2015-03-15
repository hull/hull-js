_ = require '../../utils/lodash'
Import = require './import'
assign = require 'object-assign'
findUrl = require '../../utils/find-url'
SandboxedShare = require '../sharer/sandboxed-sharer';

registry = {}

setDimension = (el, dim, val)->
  if val?
    val = "#{val}px" if /[0-9]+$/.test(val.toString())
    el.style[dim] = val

resetDeployments = () ->
  deployment.remove() for own key, deployment of registry
  registry = {}

class Deployment
  @resetDeployments: resetDeployments


  constructor: (dpl)->
    return registry[dpl.id] if registry[dpl.id]
    registry[dpl.id] = @
    @id         = dpl.id
    @name       = dpl.ship.name

    @platform   = dpl.platform
    @ship       = dpl.ship
    # "index"-> href for embed

    @settings   = dpl.settings
    # "_selector" : ".ship", //CSS3 Selector on which to embed the ship(s)
    # "_multi": true, //Wether to embed on the first matching element or all
    # "_placement" : "before"|"after"|"append"|"prepend"|"replace", //Position relative to selector
    # "_sandbox" : true //Wether to sandbox the platform : true
    # "_width" : "100%", //Dimensions to give the containing element. Passed as-is as style tag
    # "_height" : "50px", //Dimensions to give the containing element. Passed as-is as style tag

    @targets    = @getTargets()
    @_imports   = []
    @_elements  = []
    @_callbacks = []

  getTargets : (opts={})->
    selector = @settings._selector
    targets = []
    return [] if !selector || selector.length == 0
    return @targets if @targets and !opts.refresh

    if @settings._multi
      targets = document.querySelectorAll selector
    else
      target = document.querySelector selector
      targets = [target] if target

  forEachTarget: (callback, args...)=>
    targets = @getTargets()
    return unless targets?.length
    callback.apply(@, [target].concat(args)) for target in targets
    @flushCallbacks()

  flushCallbacks : ()=>
    callbacks = @_callbacks.slice()
    cb = callbacks.shift()
    while cb
      cb.call @
      cb = callbacks.shift()
    @_callbacks = []

  # Build a sandbox for the current ship.
  # Will contain : 
  # an enhanced version of Hull, with methods that resolve locally
  # - setShipSize
  # - getTargetUrl
  prepareIframeSandbox : (iframe)->
    w = iframe.contentWindow
    setShipSize = (size={})=>
      setDimension(iframe, 'width', size.width) if size.width?
      setDimension(iframe, 'height', size.height) if size.height?
      true

    # Start resolving from the containing iframe up

    # TODO architecture could be better herer 
    sandboxedShare = new SandboxedShare({
      share: Hull.share, 
      ship: @ship, 
      domRoot: iframe
    })

    sandboxedFindUrl = ()->
      findUrl(iframe)

    w.location.hash='/'
    w.Hull = assign({}, window.Hull, {
      setShipSize: setShipSize
      share   : sandboxedShare.share
      findUrl : sandboxedFindUrl
    });

  embed : (opts={}, embedCompleteCallback)->
    @targets = @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)
    if @settings._sandbox
      @forEachTarget (target, args...)=>
        iframe = @embedIframe(target)
        @insert(target, iframe)
        embedIframeImport = ()=>
          doc = iframe.contentDocument
          if doc and doc.readyState=='complete'
            @prepareIframeSandbox(iframe)
            @_imports.push = new Import {href: @ship.index, sandbox:iframe}, (imprt)=>
              body = doc.getElementsByTagName('body')[0]
              ship = document.createElement('div')
              ship.id='ship'
              body.appendChild(ship)
              el = @embedImport(ship, imprt);
          else
            setTimeout ()->
              embedIframeImport()
            ,10
        embedIframeImport()
    else
      @forEachTarget (target, args...)=>
        @_imports.push = new Import {href: @ship.index}, (imprt)=>
          el = document.createElement 'div'
          @embedImport(el, imprt)
          @insert(target, el)


  embedIframe : (target, src)->
    frame = document.createElement 'iframe'
    frame.src                    = src if src?
    frame.vspace                 = 0
    frame.hspace                 = 0
    frame.marginWidth            = 0
    frame.marginHeight           = 0
    frame.scrolling              = 'no'
    frame.border                 = 0
    frame.frameBorder            = 0
    frame.dataset.hullDeployment = @id
    frame.dataset.hullShip       = @ship.id
    @insert target, frame
    frame

  embedImport : (target, link)->
    doc = link.import
    body = doc.body.cloneNode true
    target.dataset.hullDeployment = @id
    target.dataset.hullShip = @ship.id
    if body.hasChildNodes()
      while child = body.firstChild
        # http://www.html5rocks.com/en/tutorials/webcomponents/imports/
        child.scoped=true if child.nodeName == "STYLE"
        # https://github.com/thingsinjars/jQuery-Scoped-CSS-plugin
        # https://github.com/PM5544/scoped-polyfill
        # https://www.npmjs.com/package/css-transform#readme
        # https://github.com/MaxGfeller/apply-css
        # https://github.com/reworkcss/css
        # https://cssnext.github.io/cssnext-playground/
        target.appendChild child.cloneNode(true) if child.nodeName != 'SCRIPT'
        body.removeChild child
    doc.onEmbed(target, @) if doc?.onEmbed

  remove: ()=>
    @targets = false
    el = @_elements.shift()
    link = document.querySelector("link[rel=\"import\"][href=\"#{@ship.index}\"]")
    link.parentNode.removeChild link if link?.parentNode?
    while el
      el?.parentNode?.removeChild el
      el = @_elements.shift()

  insert: (target, el)->
    setDimension(el, 'width', @settings._width || '100%')
    setDimension(el, 'height', @settings._height)
    @_elements.push el
    switch @settings._placement
      when 'before' then target.parentNode.insertBefore(el, target)
      when 'after'  then target.parentNode.insertBefore(el, target.nextSibling)
      when 'top'    then target.insertBefore(el, target.firstChild)
      when 'replace'
        if target.nodeName == 'IMG'
          target.parentNode.replaceChild(el, target)
        else
          target.removeChild(target.firstChild) while target.firstChild
          target.appendChild(el)
      else
        # Embed at append
        target.appendChild(el)

module.exports = Deployment
