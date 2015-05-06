_        = require '../../../utils/lodash'
BaseDeploymentStrategy = require './base'

class ScopeDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : true

  ###*
   * Scoped : One hidden Iframe holds JS and Style, callback method called for each target
   * @return {promise} A promise for when the import is loaded inside the iframe
  ###
  deploy: (targets)->
    @insertions = []

    @embedIframe().then (iframe)=>
      @import = @embedImport(iframe)

      @import.when.ready.then (doc)=>
        @document = doc
        el = @cloneImport(doc)
        @addInsertion(@insert(el.cloneNode(true), target), iframe) for target in targets
      .catch throwErr

      @import.when.loaded.catch throwErr
      @import.when.loaded

  destroy: ()=>
    @import.destroy()
    @sandbox.destroy()
    super()

module.exports = ScopeDeploymentStrategy
