scriptLoader = require '../../../utils/script-loader'
BaseDeploymentStrategy = require './base'

class JSDeploymentStrategy extends BaseDeploymentStrategy

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  deploy : (targets)->
    @elements = []

    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@deployment.id}\"]");
    @addElement(target) for target in targets

    return @boot() if sc?

    attributes = 
      'data-hull-deployment': @deployment.id
      'data-hull-ship'      : @deployment.ship.id

    scriptLoader({src:@deployment.ship.index, attributes})

module.exports = JSDeploymentStrategy
