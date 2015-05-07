_                      = require '../../../utils/lodash'
throwErr               = require '../../../utils/throw'
BaseDeploymentStrategy = require './base'

class RawDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false

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
      @setupSandbox(doc)
      el = @cloneImport(doc)
      @addInsertion(@insert(el.cloneNode(true), target)) for target in targets
    .catch throwErr

    @import.when.loaded.catch throwErr

    @import.when.loaded

  addInsertion : (el, iframe, doc)=>
    @sandbox.addElement(el)
    @insertions.push {el, iframe, doc, ready:false, callbacks:[]}

  onEmbed: ()=>
    # We retreive callbacks from the document
    # because when removing an Import, and readding it, the scripts aren't reloaded, so Callbacks don't get registered again.
    # Ensure every insertion has been called with every callback just once.
    @ready.promise.then ()=>
      callbacks = @document._hullCallbacks || []
      _.map @insertions, (insertion)=>
        _.map callbacks, (callback)=>
          unless _.find(insertion.callbacks, (d)-> d==callback)
            insertion.callbacks.push(callback)
            callback(insertion.el, @deployment, @sandbox.hull)

  destroy: ()=>
    @import.destroy()
    @sandbox.destroy()
    super()

module.exports = RawDeploymentStrategy
