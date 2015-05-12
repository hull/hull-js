_                      = require '../../../utils/lodash'
throwErr               = require '../../../utils/throw'
scriptLoader = require '../../../utils/script-loader'
BaseDeploymentStrategy = require './base'

class JSDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  embed : (targets)->
    @elements = []
    @setupSandbox()

    for target in targets
      el = document.createElement('div')
      @addInsertion(@insert(el, target))


    sc = document.querySelector("[data-hull-deployment=\"#{@deployment.id}\"]");

    attributes = 
      'data-hull-deployment': @deployment.id
      'data-hull-ship'      : @deployment.ship.id

    scriptLoader({src:@deployment.ship.index, attributes})
    .then @ready.resolve
    .catch throwErr

  addInsertion : (el)=>
    @sandbox.addElement(el)
    @insertions.push {el, ready:false, callbacks:[]}

  onEmbed: (callback)=>
    if callback
      @ready.promise.then ()=>
        _.map @insertions, (insertion)=>
          callback(insertion.el, @deployment.getPublicData(), @sandbox.hull)

module.exports = JSDeploymentStrategy
