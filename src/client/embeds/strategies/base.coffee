Promise  = require 'bluebird'
_        = require '../../../utils/lodash'
setStyle = require '../../../utils/set-style'
logger   = require '../../../utils/logger'
Import   = require '../import'
Sandbox  = require '../sandbox'

class BaseDeploymentStrategy
  scopeStyles : false
  ignoredTags : ['#comment','SCRIPT']
  headTags   : ['LINK', 'STYLE']

  constructor : (deployment)->
    @deployment      = deployment
    @sandbox         = new Sandbox(deployment, @scopeStyles)

    @ready           = {}
    @ready.promise   = new Promise (resolve, reject)=>
      @ready.resolve = resolve
      @ready.reject  = reject

    @insertions      = []


  addInsertion : ()->
  embed        : ()->
  onEmbed      : ()->
  addShipClasses : (el)->
    el.classList.add("ship-#{@deployment.ship.id}", "ship-deployment-#{@deployment.id}")
    el.setAttribute('data-hull-deployment', @deployment.id)
    el.setAttribute('data-hull-ship', @deployment.ship.id)
  setupSandbox: (doc) =>
    @sandbox.setDocument(doc)


  ###*
   * Inserts the content of a HTML import into a given dom node.
   * @param  {Node} doc   Import Document Element
   * @return {Node}       An Element containing a cloned instance of the Import
  ###
  cloneImport : (doc, container=document)->
    # Import Container
    el = document.createElement('div')

    hull_in_ship = doc.getElementById('hull-js-sdk')

    if hull_in_ship?
      msg = """
        It seems the ship "#{@deployment.ship.name}" is trying to load #{@deployment.ship.index} that contains a copy of Hull.js.
        This can't happen. Skipping ship.
      """
      err = new Error(msg)
      logger.error(err.message)
      return el

    head = container.getElementsByTagName('head')[0];
    # Like with Shrimps, HEAD is not interesting in HTML Imports. Don't use it
    @parseChildren({
      imported  : doc.body
      el        : el
      ignore    : @ignoredTags
      move      : @headTags
      head      : head
    })
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
    {imported, el, ignore, head, move} = opts
    return true unless imported.hasChildNodes()
    # https://developer.mozilla.org/en-US/docs/Web/API/Document/importNode
    # Shall we use importNode instead ? what about it's support...
    _.map imported.childNodes, (child)=>
      if child
        nodeName = child.nodeName
        unless _.contains(ignore, nodeName)
          if _.contains move, nodeName
            child.parentNode.removeChild(child)
            head.appendChild(child)
          else
            el.appendChild(child.cloneNode(true))

  ###*
   * Insert an element at the right position relative to a target.
   * @param  {Node} el     The element to insert
   * @param  {Node} target The target where to insert the content
   * @return {Node}        el
  ###
  insert: (el, target)->
    @addShipClasses(el)
    setStyle.style(el, {width:@deployment.settings._width || '100%', height:@deployment.settings.height})
    switch @deployment.settings._placement
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
   * Embeds an Import into a container (iframe or main window)
   * @param  {Node | undefined} container Where to load the HTML Import. Window or empty iframe
   * @return {promise}          A promise resolved onLoad with the container, the newly created element
  ###
  embedImport : (container)=>
    imprt = new Import {shipId: @deployment.ship.id, href: @deployment.ship.index, container: container, scoped: @scopeStyles}
    imprt.when.loaded.then @ready.resolve
    imprt

  destroy: ()=>
    _.map @insertions, (insertion)-> insertion.el?.parentNode?.removeChild(insertion.el)
    @insertions = {}

module.exports = BaseDeploymentStrategy
