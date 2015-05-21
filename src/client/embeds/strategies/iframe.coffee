promises               = require '../../../utils/promises'
_                      = require '../../../utils/lodash'
throwErr               = require '../../../utils/throw'
getIframe              = require '../../../utils/get-iframe'
Sandbox                = require '../sandbox'
Iframe                 = require '../iframe'
BaseDeploymentStrategy = require './base'
class IframeDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false

  ###*
   * Sandboxed : Multiple Iframes, one for each target, completely isolated
   * @return {promises} a promise that will resolve when all imports have been loaded in each iframe
  ###
  embed: (targets)->
    @insertions = []
    @setupSandbox()

    # For each target, embed a new Iframe, that will in turn embed the Import
    readyPromises = _.map targets, (target)=>
      @embedIframe(target).then (iframe)=>

        insertion = {iframe, ready:false, callbacks:[]}
        insertion.sandbox = @sandbox.scope(insertion)

        imprt = @embedImport(iframe)

        imprt.when.ready.then (doc)=>
          insertion.doc = doc
          iframeDoc = getIframe.document(iframe)
          el = @cloneImport(doc, iframeDoc)
          insertion.el = el
          iframeDoc.body.appendChild el
          @insertions.push insertion
        .catch throwErr

        imprt.when.loaded.catch throwErr
        imprt.when.loaded
      .catch throwErr

    Promise.all(readyPromises)
  
  onEmbed: ()=>
    # Ensure every insertion has been called with every callback just once.
    @ready.promise.then ()=>
      _.map @insertions, (insertion)=>
        callback(insertion.el, @deployment.getPublicData(), insertion.sandbox.hull) while callback = insertion.callbacks.shift()
    .catch throwErr


  ###*
   * Embeds an iframe in a DOM container or directly in the Body
   * 
   * @param  {Node|NodeArray} targets A single node or an array of Nodes
   * @return {object}         an object containing a promise for when the import is loaded, the elements created and the target node(s)
  ###
  embedIframe : (container)=>
    embed = {}
    new Promise (resolve, reject)=>
      iframe  = new Iframe {id: @deployment.id, hidden: !@deployment.settings._sandbox}, (iframe)=>
        @addShipClasses(iframe)
        getIframe.document(iframe).shipId = @deployment.ship.id
        resolve(iframe)
      # Insert Iframe into main window
      # Needs to be done otherwise iframe won't get initialized
      if container then @insert(iframe.getIframe(),container) else document.body.appendChild(iframe.getIframe())

  destroy: ()=>
    insertion.iframe?.parentNode?.removeChild(insertion.iframe) for insertion in @insertions
    @insertions = []
    @sandbox.destroy()
    super()

module.exports = IframeDeploymentStrategy
