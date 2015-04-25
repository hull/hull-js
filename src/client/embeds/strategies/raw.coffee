BaseDeploymentStrategy = require './base'
Sandbox  = require '../sandbox'

class RawDeploymentStrategy extends BaseDeploymentStrategy
  ###*
   * Sandboxed : Multiple Iframes, one for each target, completely isolated
   * @return {promises} a promise that will resolve when all imports have been loaded in each iframe
  ###
  deploy: (targets)->
    debugger
    sandbox = new Sandbox(@ship, @, false)

    # For each target, embed a new Iframe, that will in turn embed the Import
    imprt = @embedImport()

    imprt.ready.then (imprt)=>
      # Insert import into Iframe
      debugger
      @insert(imprt.el.cloneNode(true), target) for target in targets
    .done()

    # Boot Ship inside Import
    imprt.load.then (el)=>
      debugger
      sandbox.addElement(el)
      sandbox.boot()
      @dfd.resolve(el)

    @dfd.promise

module.exports = RawDeploymentStrategy
