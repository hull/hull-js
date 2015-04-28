scriptLoader = require '../../../utils/script-loader'
BaseDeploymentStrategy = require './base'

class JSDeploymentStrategy extends BaseDeploymentStrategy

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  deploy : (targets)->
    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@deployment.id}\"]");
    return if sc?

    attributes = 
      'data-hull-deployment': @deployment.id
      'data-hull-ship'      : @deployment.ship.id

    @addElement(target) for target in targets

    return scriptLoader({src:@deployment.ship.index, attributes}).then ()=>
      @sandbox.boot(@elements)

module.exports = JSDeploymentStrategy
