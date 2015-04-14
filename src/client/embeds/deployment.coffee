assign   = require 'object-assign'
_        = require '../../utils/lodash'
setStyle = require '../../utils/set-style'
Import   = require './import'
Iframe   = require './iframe'
LocalHull  = require './sandbox'
scriptLoader = require '../../utils/script-loader'

registry = {}
resetDeployments = () ->
  deployment.remove() for own key, deployment of registry
  registry = {}

getDeployment = (id)-> registry[id]

class Deployment
  @resetDeployments: resetDeployments

  @getDeployment : getDeployment

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

    callbacks = @_callbacks.slice()
    cb = callbacks.shift()
    while cb
      cb.call @
      cb = callbacks.shift()
    @_callbacks = []

  embedScript : ()->
    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@id}\"]");
    return if sc?

    @_localHull = LocalHull(@ship)
    attributes = 
      'data-hull-deployment': @id
      'data-hull-ship'      : @ship.id

    sc = scriptLoader {src:@ship.index, attributes}, (event)=>

  embed : (opts={}, embedCompleteCallback)=>
    # if we're refreshing, rebuild the target list
    @targets = @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)
    callback = ()->

    if @ship.index.match(/\.js/)
      @embedScript()
    return true


    if @settings._sandbox
      @forEachTarget (target, args...)=>
        onIframeReady = (iframe)=>
          iframe.setAttribute('data-hull-deployment', @id)
          iframe.setAttribute('data-hull-ship', @ship.id)
          # Create the import inside the frame
          doc = iframe.contentDocument
          body = doc.getElementsByTagName('body')?[0] || doc.firstChild

          # Sandbox needs to be in place before onLoad happens for iFrames :
          # it's there that the local window.Hull gets injected in the iframe
          @_localHull = LocalHull(@ship, iframe)

          @_imports.push = new Import {href: @ship.index, container:iframe}, (link)=>
            el = @setupImport(link)
            body.appendChild el
            # Boot the ship
            @performCallback(el, link.import.onEmbed)
        iframe = new Iframe({target, ship, id:@id}, onIframeReady)
        @insert target, iframe.getIframe()

    else
      @forEachTarget (target, args...)=>
        @_imports.push = new Import {href: @ship.index}, (link)=>
          # @embedShadow(rootEl, link)
          el = @setupImport(link)
          @insert target, el
          @_localHull = LocalHull(@ship)
          # Boot the ship
          @performCallback(el, link.import.onEmbed)
    return true

  # Inserts the content of a HTML import into a given dom node.
  setupImport : (link)->
    el = document.createElement('div')
    el.classList.add('ship',"ship-#{@ship.id}", "ship-deployment-#{@id}")
    el.setAttribute('data-hull-deployment', @id)
    el.setAttribute('data-hull-ship', @ship.id)
    doc = link.import
    hull_in_ship = doc.getElementById('hull-js-sdk')

    if hull_in_ship?
      msg = """
        It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
        This can't happen. Skipping ship.
      """
      err = new Error(msg)
      console.error(err.message)
      return el

    body = doc.body.cloneNode true
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
    el

  # embedShadow : (el, link)->
  #   shadow = el.createShadowRoot();
  #   doc = link.import
  #   body = doc.body.cloneNode true
  #   el.setAttribute('data-hull-deployment', @id)
  #   el.setAttribute('data-hull-ship', @ship.id)
  #   hull_in_ship = doc.getElementById('hull-js-sdk')
  #   msg = """
  #     It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
  #     This can't happen. Skipping ship.
  #   """
  #   if hull_in_ship?
  #     err = new Error(msg)
  #     return console.error(err.message)
  #   if body.hasChildNodes()
  #     while child = body.firstChild
  #       child.scoped = true if child.nodeName == "STYLE"
  #       shadow.appendChild wrap(child.cloneNode(true)) if child.nodeName && child.nodeName != 'SCRIPT'
  #       body.removeChild wrap(child)
  #   shadow

  performCallback : (target, callback)=>
    return unless _.isFunction callback
    @callback = callback
    @callback(target, @, @_localHull);

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
