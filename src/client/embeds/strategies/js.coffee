Promise       = require '../../../utils/promises'
_             = require '../../../utils/lodash'
setStyle      = require '../../../utils/set-style'
logger        = require '../../../utils/logger'
throwErr      = require '../../../utils/throw'
scriptLoader  = require '../../../utils/script-loader'
Sandbox       = require '../sandbox'

scripts = {}

getScript = (deployment)-> scripts[deployment.ship.id]
setScript = (deployment, sc) -> scripts[deployment.ship.id] = sc

class JSDeploymentStrategy
  scopeStyles : false

  constructor : (deployment)->
    @deployment      = deployment
    @sandbox         = new Sandbox(deployment)
    @ready           = {}
    @insertions      = []
    @ready.promise   = new Promise (resolve, reject)=>
      @ready.resolve = resolve
      @ready.reject  = reject

  addShipClasses : (el)->
    el.className = el.className + " ship-#{@deployment.ship.id} ship-deployment-#{@deployment.id}"
    el.setAttribute('data-hull-deployment', @deployment.id)
    el.setAttribute('data-hull-ship', @deployment.ship.id)

  ###*
   * Insert an element at the right position relative to a target.
   * @param  {Node} el     The element to insert
   * @param  {Node} target The target where to insert the content
   * @return {Node}        el
  ###
  insert: (el, target)->
    @addShipClasses(el)
    setStyle(el, {width:@deployment.settings._width || '100%', height:@deployment.settings.height})
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

  destroy: ()=>
    _.map @insertions, (insertion)-> insertion.el?.parentNode?.removeChild(insertion.el)
    @insertions = {}

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  embed : (targets)->
    @elements = []

    for target in targets
      el = document.createElement('div')
      @addInsertion(@insert(el, target))


    sc = document.querySelector("[data-hull-ship-script=\"#{@deployment.ship.id}\"]");
    if !getScript(@deployment)
      setScript(@deployment, true)
      attributes =
        'data-hull-deployment'       : @deployment.id
        'data-hull-ship-script'      : @deployment.ship.id

      scriptLoader({src:@deployment.ship.index, attributes})
      .then (args...)=>
        @ready.resolve(args...)
      .catch (err)=>
        @ready.reject(err)
        throwErr(err)
    else
      new Promise (resolve, reject)=>
        @ready.resolve()
        resolve()

  addInsertion : (el)=>
    @sandbox.addElement(el)
    @insertions.push {el, ready:false, callbacks:[]}

  onEmbed: (callback)=>
    if callback
      @ready.promise.then ()=>
        _.map @insertions, (insertion)=>
          callback(insertion.el, @deployment.getPublicData(), @sandbox.hull)
      .catch throwErr

module.exports = JSDeploymentStrategy
