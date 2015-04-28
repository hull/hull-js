_        = require '../../../utils/lodash'
BaseDeploymentStrategy = require './base'

class ScopeDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : true

  ###*
   * Scoped : One hidden Iframe holds JS and Style, callback method called for each target
   * @return {promise} A promise for when the import is loaded inside the iframe
  ###
  deploy: (targets)->

    @embedIframe().then (iframe)=>

      @sandbox.setContainer(iframe)

      imprt = @embedImport(iframe)

      imprt.ready.then (imported)=>
        @addElement(@insert(imported.el.cloneNode(true), target)) for target in targets

      imprt.load.then (el)=>
        @sandbox.boot(@elements)

module.exports = ScopeDeploymentStrategy
