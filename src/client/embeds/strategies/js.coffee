Promise                = require('es6-promise').Promise
_                      = require '../../../utils/lodash'
throwErr               = require '../../../utils/throw'
scriptLoader = require '../../../utils/script-loader'
BaseDeploymentStrategy = require './base'

scripts = {}

getScript = (deployment)-> scripts[deployment.ship.id]
setScript = (deployment, sc) -> scripts[deployment.ship.id] = sc

class JSDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  embed : (targets)->
    @elements = []
    @setupSandbox()

    sc = document.querySelector("[data-hull-ship-script=\"#{@deployment.ship.id}\"]");
    if !getScript(@deployment)
      setScript(@deployment, true)
      attributes = 
        'data-hull-deployment'       : @deployment.id
        'data-hull-ship-script'      : @deployment.ship.id

      scriptLoader({src:@deployment.ship.index, attributes})
      .then ()=>
        @done(targets)
      .catch @ready.reject
    else
      new Promise (resolve, reject)=>
        @done(targets)
        resolve()

  done: (targets)=>
    for target in targets
      el = document.createElement('div')
      @addInsertion(@insert(el, target))

    @ready.resolve()

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
