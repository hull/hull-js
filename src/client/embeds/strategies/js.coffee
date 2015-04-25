scriptLoader = require '../../../utils/script-loader'
BaseDeploymentStrategy = require './base'

class JSDeploymentStrategy extends BaseDeploymentStrategy

  ###*
   * Embeds a Script in the page
   * @return {promise} a promise for the onLoad event
  ###
  embedScript : ()->
    # sc = document.getElementById(id)
    # return if sc
    sc = document.querySelector("[data-hull-deployment=\"#{@deploymentId}\"]");
    return if sc?

    attributes = 
      'data-hull-deployment': @deploymentId
      'data-hull-ship'      : @ship.id

    return scriptLoader({src:@ship.index, attributes}).then @dfd.resolve


module.exports = JSDeploymentStrategy
