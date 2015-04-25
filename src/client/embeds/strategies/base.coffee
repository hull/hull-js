_        = require '../../../utils/lodash'
promises = require '../../../utils/promises'
setStyle = require '../../../utils/set-style'
Import   = require '../import'
Iframe   = require '../iframe'

class BaseDeploymentStrategy
  constructor : (opts={})->
    @dfd = promises.deferred()
    @ship = opts.ship
    @settings = opts.settings
    @deploymentId = opts.id

  addShipClasses : (el)->
    el.classList.add('ship',"ship-#{@ship.id}", "ship-deployment-#{@deploymentId}")
    el.setAttribute('data-hull-deployment', @deploymentId)
    el.setAttribute('data-hull-ship', @ship.id)

  ###*
   * Inserts the content of a HTML import into a given dom node.
   * @param  {Node} doc   Import Document Element
   * @return {Node}       An Element containing a cloned instance of the Import
  ###
  cloneImport : (doc, container=document)->
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

    # Like with Shrimps, HEAD is not interesting in HTML Imports. Don't use it
    @parseChildren({
      imprt  : doc.body
      body   : el
      ignore : ['#comment','SCRIPT']
      head   : container.head
      move   : ['STYLE', 'LINK']
    })
    el


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

  ###*
   * shuffles DOM elements from an Import, moves them or copy them to the right place
   * @param  {[type]} opts={} [description]
   * @return {[type]}           [description]
  ###
  parseChildren : (opts={}) ->
    # You need to take the following into account when manipulating imports : 
    # "Real" (Chrome) HTML imports will be isolated from the main document.
    # Polyfilled ones will return their content when querying the main document (I.E document.styleSheets)
    # Tread wisely
    {imprt, body, ignore, head, move} = opts
    return true unless imprt.hasChildNodes()
    _.map imprt.childNodes, (child)=>
      if child
        unless _.contains(ignore, child.nodeName)
          if _.contains move, child.nodeName
            child.parentNode.removeChild(child)
            head.appendChild(child.cloneNode(true))
          else
            body.appendChild(child.cloneNode(true))

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
      doc.deploymentId = @deploymentId
      el = @cloneImport(doc, container?.contentDocument)
      # Insert a copy of this Node into container
      readyDfd.resolve({el, doc})

    # Boot the ship
    loadCallback  = ()=>
      loadDfd.resolve(el)
    # Return elements, targets and container element.
    # readyCallback is guaranteed to have been executed here.

    new Import {href: @ship.index, container: container}, readyCallback, loadCallback
    {ready:readyDfd.promise, load: loadDfd.promise}

  ###*
   * Embeds an iframe in a DOM container or directly in the Body
   * 
   * @param  {Node|NodeArray} targets A single node or an array of Nodes
   * @return {object}         an object containing a promise for when the import is loaded, the elements created and the target node(s)
  ###
  embedIframe : (container)=>
    dfd = promises.deferred()
    iframe  = new Iframe {id: @deploymentId, hidden: !@settings._sandbox}, (iframe)=>
      @addShipClasses(iframe)
      iframe.contentDocument.deploymentId = @deploymentId
      dfd.resolve(iframe)

    # Insert Iframe into main window
    # Needs to be done otherwise iframe won't get initialized
    if container then @insert(iframe.getIframe(),container) else document.body.appendChild(iframe.getIframe())
    dfd.promise


module.exports = BaseDeploymentStrategy
