BaseDeploymentStrategy = require './base'
throwErr               = require '../../../utils/throw'

class RawDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : true

  ###*
   * Raw : Directly in the page
   * @return {promises} a promise that will resolve when all elements have been loaded.
  ###
  embed: (targets)->
    @insertions = []

    # For each target, embed a new Iframe, that will in turn embed the Import
    @import = @embedImport()

    @import.when.ready.then (doc)=>
      @document = doc
      el = @cloneImport(doc)
      @addInsertion(@insert(el.cloneNode(true), target)) for target in targets
    .catch throwErr

    @import.when.loaded.catch throwErr

    @import.when.loaded

  destroy: ()=>
    @import.destroy()
    @sandbox.destroy()
    super()

module.exports = RawDeploymentStrategy
