_ = require '../../utils/lodash'
Import = require './import'
Iframe = require './iframe'
assign = require 'object-assign'
setStyle = require '../../utils/set-style'

registry = {}
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

  # Fetches all targets specified in a deployment
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

  # calls the specified callback for each target in the deployment
  forEachTarget: (callback, args...)=>
    return unless @targets?.length
    callback.apply(@, [target].concat(args)) for target in @targets
    @flushCallbacks()

  # executes a callback from the callback stack
  flushCallbacks : ()=>
    callbacks = @_callbacks.slice()
    cb = callbacks.shift()
    while cb
      cb.call @
      cb = callbacks.shift()
    @_callbacks = []


  embed : (opts={}, embedCompleteCallback)->
    # if we're refreshing, rebuild the target list
    @targets = @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)
    targetCallback = ()->
    if @settings._sandbox
      targetCallback = (target, args...)=>
        onIframeReady = (iframe)=>
          iframe.setAttribute('data-hull-deployment', @id)
          iframe.setAttribute('data-hull-ship', @ship.id)

          # Embed iframe in the page

          # Create the import inside the frame
          @_imports.push = new Import {href: @ship.index, sandbox:iframe}, (imprt)=>
            # Iframe imports are done on a #ship element directly inside the body;
            body = iframe.contentDocument.getElementsByTagName('body')[0]
            rootEl = document.createElement('div')
            rootEl.id = 'ship'
            body.appendChild(rootEl)
            el = @embedImport(rootEl, imprt);
        iframe = new Iframe({target, ship}, onIframeReady)
        @insert(target, iframe.getIframe())

    else

      targetCallback = (target, args...)=>
        @_imports.push = new Import {href: @ship.index}, (imprt)=>
          el = document.createElement 'div'
          @embedShadow(el, imprt)
          @insert(target, el)

    @forEachTarget targetCallback


  embedImport : (el, link)->
    doc = link.import
    body = doc.body.cloneNode true
    el.setAttribute('data-hull-deployment', @id)
    el.setAttribute('data-hull-ship', @ship.id)
    hull_in_ship = doc.getElementById('hull-js-sdk')
    msg = """
      It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
      This can't happen. Skipping ship.
    """
    if hull_in_ship?
      err = new Error(msg)
      return console.error(err.message)
    if body.hasChildNodes()
      while child = body.firstChild
        # http://www.html5rocks.com/en/tutorials/webcomponents/imports/
        child.scoped = true if child.nodeName == "STYLE"
        # https://github.com/thingsinjars/jQuery-Scoped-CSS-plugin
        # https://github.com/PM5544/scoped-polyfill
        # https://www.npmjs.com/package/css-transform#readme
        # https://github.com/MaxGfeller/apply-css
        # https://github.com/reworkcss/css
        # https://cssnext.github.io/cssnext-playground/
        el.appendChild child.cloneNode(true) if child.nodeName != 'SCRIPT'
        body.removeChild child
    doc.onEmbed(el, @) if doc?.onEmbed

  embedShadow : (el, link)->
    shadow = el.createShadowRoot();
    doc = link.import
    body = doc.body.cloneNode true
    el.setAttribute('data-hull-deployment', @id)
    el.setAttribute('data-hull-ship', @ship.id)
    hull_in_ship = doc.getElementById('hull-js-sdk')
    msg = """
      It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
      This can't happen. Skipping ship.
    """
    if hull_in_ship?
      err = new Error(msg)
      return console.error(err.message)
    if body.hasChildNodes()
      while child = body.firstChild
        # http://www.html5rocks.com/en/tutorials/webcomponents/imports/
        child.scoped = true if child.nodeName == "STYLE"
        # https://github.com/thingsinjars/jQuery-Scoped-CSS-plugin
        # https://github.com/PM5544/scoped-polyfill
        # https://www.npmjs.com/package/css-transform#readme
        # https://github.com/MaxGfeller/apply-css
        # https://github.com/reworkcss/css
        # https://cssnext.github.io/cssnext-playground/
        shadow.appendChild wrap(child.cloneNode(true)) if child.nodeName && child.nodeName != 'SCRIPT'
        body.removeChild wrap(child)
    doc.onEmbed(shadow, @) if doc?.onEmbed

  remove: ()=>
    @targets = false
    el = @_elements.shift()
    link = document.querySelector("link[rel=\"import\"][href=\"#{@ship.index}\"]")
    link.parentNode.removeChild link if link?.parentNode?
    while el
      el?.parentNode?.removeChild el
      el = @_elements.shift()

  # insert an element at the right position relative to a target.
  insert: (target, el)->
    setStyle.style(el, {width:@settings._width || '100%', height:@settings.height})
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
