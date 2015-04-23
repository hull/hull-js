assign   = require '../../polyfills/assign'
_        = require '../../utils/lodash'
setStyle = require '../../utils/set-style'
scriptLoader = require '../../utils/script-loader'
Import   = require './import'
Iframe   = require './iframe'
Sandbox  = require './sandbox'
ScopedCss = require 'scopedcss/lib/'
promises = require '../../utils/promises'

registry = {}

resetDeployments = () ->
  deployment.remove() for own key, deployment of registry
  registry = {}

getDeployment = (id)-> registry[id]

class Deployment
  @resetDeployments: resetDeployments
  @getDeployment : getDeployment

  constructor: (dpl, context)->
    return registry[dpl.id] if registry[dpl.id]
    registry[dpl.id] = @
    @id         = dpl.id
    @name       = dpl.ship.name

    @organization = assign({}, context.org)
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
    @_styles    = []
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

  embedScript : ()->
    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@id}\"]");
    return if sc?

    attributes =
      'data-hull-deployment': @id
      'data-hull-ship'      : @ship.id

    scriptLoader({src:@ship.index, attributes}).then (scriptTag)->

    true

  embed : (opts={}, embedCompleteCallback)=>
    # if we're refreshing, rebuild the target list
    @targets = @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)


    if @ship.index.match(/\.js/)
      @embedScript()
    else
      @localHull = new Sandbox(@ship, @)
      @_iframe  = new Iframe {id: @id}, (iframe)=>
        iframe.contentDocument.deploymentId = @id
        @localHull.setContainer(iframe)

        readyCallback = (doc)=>
          doc.deploymentId = @id
          el = @import(doc, el)
          @scopeStyles()
          @addShipClasses(el)
          @localHull.get().applyStyles(iframe.contentDocument.head)
          @insert(el.cloneNode(true), target) for target in @targets

        # Boot the ship
        loadCallback  = ()=>
          @_ready = true
          @bootShip(el, @localHull.get()) for el in @_elements

        new Import {href: @ship.index, container: iframe}, readyCallback, loadCallback

      # prs = if @settings._sandbox
      #   @embedIframe(target) for target in @targets
      # else
      #   @embedImport(target) for target in @targets
      # promises.allSettled(prs).then @scopeStyles
      document.getElementsByTagName('body')[0].appendChild(@_iframe.getIframe())

    cb.call(@) for cb in @_callbacks
    @_callbacks = []
    return true

  scopeStyles : ()=> _.map @_styles, (style)=>
    scoped = new ScopedCss(".ship-#{@ship.id}", null, style.tag);
    style.scoped = scoped
    scoped.process();
    scoped

  onEmbed: (fn)->
    @_onEmbed = fn
    if @_ready
      sandbox = @localHull.get()
      @bootShip(el, sandbox) for el in @_elements

  bootShip : (el, sandbox)=>
    if @_onEmbed
      sandbox.applyStyles(el)
      sandbox.track('hull.app.init')
      @_onEmbed(el, @, sandbox)

  addShipClasses : (el)->
    el.classList.add('ship',"ship-#{@ship.id}", "ship-deployment-#{@id}")
    el.setAttribute('data-hull-deployment', @id)
    el.setAttribute('data-hull-ship', @ship.id)

  # Inserts the content of a HTML import into a given dom node.
  import : (doc)->
    # Import Container
    el = document.createElement('div')

    hull_in_ship = doc.getElementById('hull-js-sdk')

    if hull_in_ship?
      msg = """
        It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
        This can't happen. Skipping ship.
      """
      err = new Error(msg)
      console.error(err.message)
      return el

    body = doc.body
    head = doc.head
    @parseChildren(head, document.getElementsByTagName('head')[0], ['SCRIPT', '#comment', '#text', 'META', 'TITLE', 'LINK'])
    @parseChildren(body, el, ['SCRIPT','#comment'])
    el

  parseChildren : (root, el, skip=[]) ->
    return true unless root.hasChildNodes()
    children = root.childNodes
    # Don't use a for ... in here since we might remove stuff and throw it off
    _.map children, (child)=>
      unless !child or _.contains(skip, child.nodeName)
        if child.nodeName == "STYLE"
          # Reference Style tags for later usage and postprocessing
          root.removeChild(child)
          @_styles.push {tag : child}
        else
          el.appendChild child.cloneNode(true)

  remove: ()=>
    @targets = false
    el = @_elements.shift()
    link = document.querySelector("link[rel=\"import\"][href=\"#{@ship.index}\"]")
    link.parentNode.removeChild link if link?.parentNode?
    while el
      el?.parentNode?.removeChild el
      el = @_elements.shift()

  # insert an element at the right position relative to a target.
  insert: (el, target)->
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
