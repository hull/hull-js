BaseDeploymentStrategy = require './base'
Sandbox  = require '../sandbox'

class SandboxDeploymentStrategy extends BaseDeploymentStrategy
  ###*
   * Sandboxed : Multiple Iframes, one for each target, completely isolated
   * @return {promises} a promise that will resolve when all imports have been loaded in each iframe
  ###
  deploy: (targets)->

    # For each target, embed a new Iframe, that will in turn embed the Import
    readyPromises = _.map targets, (target)=>
      @embedIframe(target).then (iframe)=>
        sandbox = new Sandbox(@ship, @, false, iframe)
        imprt = @embedImport(iframe)

        imprt.ready.then (imprt)=>
          # Insert import into Iframe
          d = iframe.contentDocument.createElement 'div'
          iframe.contentDocument.body.appendChild d
          @insert(imprt.el, d)
        .done()

        # Boot Ship inside Import
        imprt.load.then (el)=>
          sandbox.addElement(el)
          sandbox.boot()
      .done()

    promises.allSettled(readyPromises).then @dfd.resolve

    @dfd.promise
  

module.exports = SandboxDeploymentStrategy
