assign   = require '../../polyfills/assign'
_        = require '../../utils/lodash'
setStyle = require '../../utils/set-style'
scriptLoader = require '../../utils/script-loader'
Import   = require './import'
Iframe   = require './iframe'
Sandbox  = require './sandbox'
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
    # 

    @targets    = @getTargets()
    @_onEmbeds  = []
    @_styles    = []
    @_imports   = []
    @_elements  = []
    @_callbacks = []

  # Fetches all targets specified in a deployment
  getTargets : (opts={})->
    selector = @settings._selector || ""
    @targets ||= []
    return @targets if (@targets and !opts.refresh) || !selector

    if @settings._multi
      @targets = document.querySelectorAll selector
    else
      target = document.querySelector selector
      @targets = [target] if target
    @targets

  ###*
   * embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  embedScript : ()->
    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@id}\"]");
    return if sc?

    attributes = 
      'data-hull-deployment': @id
      'data-hull-ship'      : @ship.id

    return scriptLoader({src:@ship.index, attributes})

  ###*
   * Embeds an Import into a container (iframe or main window)
   * @param  {Node | undefined} container Where to load the HTML Import. Window or empty iframe
   * @return {promise}          A promise resolved onLoad with the container, the newly created element
  ###
  embedImport : (container)=>
    readyDfd = promises.deferred()
    loadDfd  = promises.deferred()

    el=null

    ###*
     * Import "ready" callback
     * @param  {Node} doc the Document Node inside the Import 
    ###
    readyCallback = (doc)=>
      doc.deploymentId = @id
      el = @cloneImport(doc)
      # Insert a copy of this Node into container
      readyDfd.resolve(el)

    # Boot the ship
    loadCallback  = ()=>
      # Return elements, targets and iframe element.
      # readyCallback is guaranteed to have been executed here.
      loadDfd.resolve({el, container})

    new Import {href: @ship.index, container: container}, readyCallback, loadCallback
    {ready:readyDfd.promise, load: loadDfd.promise}


  ###*
   * Embeds an iframe in the DOM, and inside this iframe, inserts an Import
   * Targets can be:
   * - a Node : insert the iframe in the node
   * - an Array of nodes
   * 
   * @param  {Node|NodeArray} targets A single node or an array of Nodes
   * @return {object}         an object containing a promise for when the import is loaded, the elements created and the target node(s)
  ###
  embedIframe : (container)=>
    dfd = promises.deferred()
    iframe  = new Iframe {id: @id, hidden: !@settings._sandbox}, (iframe)=>
      iframe.contentDocument.deploymentId = @id
      dfd.resolve(iframe)

    # Insert Iframe into main window
    # Needs to be done otherwise iframe won't get initialized
    if container then @insert(iframe.getIframe(),container) else document.body.appendChild(iframe.getIframe())
    dfd.promise

  embed : (opts={}, embedCompleteCallback)=>
    # If we're refreshing, rebuild the target list
    @targets = @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)

    if @ship.index.match(/\.js/)
      @embedScript().then @initPromise.resolve
    else
      if @settings._sandbox
        # Sandboxed : Multiple Iframes, one for each target, completely isolated

        # For each target, embed a new Iframe, that will in turn embed the Import
        readyPromises = _.map @targets, (target)=>
          @embedIframe(target).then (iframe)=>
            sandbox = new Sandbox(@ship, @, @settings._sandbox, iframe)
            imprt = @embedImport(iframe)
            imprt.ready.then (el)=>
              # Insert import into Iframe
              d = iframe.contentDocument.createElement 'div'
              iframe.contentDocument.body.appendChild d
              @insert(el, d)

            # Boot Ship inside Import
            imprt.load.then (imprt)=>
              sandbox.addElement(imprt.el)
              sandbox.boot()

            imprt.load


        # promises.allSettled(readyPromises).then (imports)=>
        #   @dfd.resolve(_.pluck(imports,'el'))
      else
        debugger
        # Scoped : One hidden Iframe holds JS and Style, callback method called for each target
        @embedIframe().then (iframe)=>
          sandbox = new Sandbox(@ship, @, @settings._sandbox, iframe)
          sandbox.watch(iframe.contentDocument.head)
          imprt = @embedImport(iframe)
          elements = []
          imprt.ready.then (el)=>
            _.map @targets, (target)=>
              elements.push(@insert(el.cloneNode(true), target))

          imprt.load.then (imprt)=>
            sandbox.addElement(element) for element in elements
            sandbox.boot()

        # @readyPromise.then (embed)=> @bootShip(el, _hull) for el in embed.elements

    cb.call(@) for cb in @_callbacks
    @_callbacks = []
    return true

  addShipClasses : (el)->
    el.classList.add('ship',"ship-#{@ship.id}", "ship-deployment-#{@id}")
    el.setAttribute('data-hull-deployment', @id)
    el.setAttribute('data-hull-ship', @ship.id)

  ###*
   * Inserts the content of a HTML import into a given dom node.
   * @param  {Node} doc   Import Document Element
   * @return {Node}       An Element containing a cloned instance of the Import
  ###
  cloneImport : (doc)->
    # Import Container
    el = document.createElement('div')
    @addShipClasses(el)

    hull_in_ship = doc.getElementById('hull-js-sdk')

    if hull_in_ship?
      msg = """
        It seems the ship "#{@ship.name}" is trying to load #{@ship.index} that contains a copy of Hull.js.
        This can't happen. Skipping ship.
      """
      err = new Error(msg)
      console.error(err.message)
      return el

    @parseChildren(doc.head, document.head, ['SCRIPT', '#comment', '#text', 'META', 'TITLE', 'LINK'])
    @parseChildren(doc.body, el, ['SCRIPT','#comment'])
    el

  parseChildren : (root, el, ignores=[]) ->
    return true unless root.hasChildNodes()
    _.map root.childNodes, (child)=>
      el.appendChild(child.cloneNode(true)) if child and not _.contains(ignores, child.nodeName)
        # if child.nodeName == "STYLE"
  
  remove: ()=>
    @targets = false
    el = @_elements.shift()
    link = document.querySelector("link[rel=\"import\"][href=\"#{@ship.index}\"]")
    link.parentNode.removeChild link if link?.parentNode?
    while el
      el?.parentNode?.removeChild el
      el = @_elements.shift()



  ###*
   * Insert an element at the right position relative to a target.
   * @param  {Node} el     The element to insert
   * @param  {Node} target The target where to insert the content
   * @return {Node}        el
  ###
  insert: (el, target)->
    setStyle.style(el, {width:@settings._width || '100%', height:@settings.height})
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
    el

module.exports = Deployment
