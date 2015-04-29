promises               = require '../../../utils/promises'
_                      = require '../../../utils/lodash'
BaseDeploymentStrategy = require './base'
Sandbox                = require '../sandbox'
throwErr               = require '../../../utils/throw'

class SandboxDeploymentStrategy extends BaseDeploymentStrategy
  ignoredTags : ['#comment','SCRIPT']
  movedTags   : ['LINK', 'STYLE']

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

        ready = imprt.ready.then (imported)=>
          # Insert import into Iframe
          sandbox.setDocument(imported.doc)
          d = iframe.contentDocument.createElement 'div'
          iframe.contentDocument.body.appendChild d
          sandbox.addElement(imported.el)
          d.appendChild imported.el
          el = imported.el

        # Boot Ship inside Import
        load = imprt.load.then ()=>
          sandbox.boot([el])

        ready.catch throwErr
        load.catch throwErr
        load

    promises.all(readyPromises)
  

module.exports = SandboxDeploymentStrategy
