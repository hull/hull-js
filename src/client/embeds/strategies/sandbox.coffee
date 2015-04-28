promises               = require '../../../utils/promises'
_                      = require '../../../utils/lodash'
BaseDeploymentStrategy = require './base'
Sandbox                = require '../sandbox'

class SandboxDeploymentStrategy extends BaseDeploymentStrategy
  ###*
   * Sandboxed : Multiple Iframes, one for each target, completely isolated
   * @return {promises} a promise that will resolve when all imports have been loaded in each iframe
  ###
  deploy: (targets)->

    # For each target, embed a new Iframe, that will in turn embed the Import
    readyPromises = _.map targets, (target)=>


      @embedIframe(target).then (iframe)=>

        @elements.push(iframe)

        el = null
        sandbox = new Sandbox(@deployment, false, iframe)
        imprt = @embedImport(iframe)

        imprt.ready.then (imported)=>
          # Insert import into Iframe
          d = iframe.contentDocument.createElement 'div'
          iframe.contentDocument.body.appendChild d
          sandbox.addElement(imported.el)
          d.appendChild imported.el
          el = imported.el

        # Boot Ship inside Import
        imprt.load.then ()=> sandbox.boot([el])

    promises.allSettled(readyPromises)
  

module.exports = SandboxDeploymentStrategy
