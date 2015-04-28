BaseDeploymentStrategy = require './base'

throwErr = (err)->
  console.log 'Something wrong happened', err.message, err.stack

class RawDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : true

  ###*
   * Raw : Directly in the page
   * @return {promises} a promise that will resolve when all elements have been loaded.
  ###
  deploy: (targets)->
    # For each target, embed a new Iframe, that will in turn embed the Import
    imprt = @embedImport()

    ready = imprt.ready.then (imported)=>
      # Insert import into Iframe
      @sandbox.setDocument(imported.doc)
      @addElement(@insert(imported.el.cloneNode(true), target)) for target in targets


    # Boot Ship inside Import
    load = imprt.load.then ()=>
      @sandbox.boot(@elements)
      @sandbox.scopeStyles()

    ready.catch throwErr
    load.catch throwErr

    load

module.exports = RawDeploymentStrategy
