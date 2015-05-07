promises               = require '../../../utils/promises'
_                      = require '../../../utils/lodash'
throwErr               = require '../../../utils/throw'
Sandbox                = require '../sandbox'
Iframe                 = require '../iframe'
BaseDeploymentStrategy = require './base'

class IframeDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false
  ignoredTags : ['#comment','SCRIPT']
  movedTags   : ['LINK', 'STYLE']

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
          el = @cloneImport(doc, iframe.contentDocument)

          insertion.el = el
          # div = iframe.contentDocument.createElement 'div'
          iframe.contentDocument.body.appendChild el
          # div.appendChild el
          @insertions.push insertion
        .catch throwErr

        imprt.when.loaded.catch throwErr
        imprt.when.loaded

    Promise.all(readyPromises)
  
  onEmbed: ()=>
    # Ensure every insertion has been called with every callback just once.
    @ready.promise.then ()=>
      _.map @insertions, (insertion)=>
        callback(insertion.el, @deployment, insertion.sandbox.hull) while callback = insertion.callbacks.shift()


  ###*
   * Embeds an iframe in a DOM container or directly in the Body
   * 
   * @param  {Node|NodeArray} targets A single node or an array of Nodes
   * @return {object}         an object containing a promise for when the import is loaded, the elements created and the target node(s)
  ###
  embedIframe : (container)=>
    embed = {}
    embed.promise = new Promise (resolve, reject)->
      embed.resolve = resolve
      embed.reject = reject
    iframe  = new Iframe {id: @deployment.id, hidden: !@deployment.settings._sandbox}, (iframe)=>
      @addShipClasses(iframe)
      iframe.contentDocument.deploymentId = @deployment.id
      embed.resolve(iframe)

    # Insert Iframe into main window
    # Needs to be done otherwise iframe won't get initialized
    if container then @insert(iframe.getIframe(),container) else document.body.appendChild(iframe.getIframe())
    embed.promise

  destroy: ()=>
    insertion.iframe.parentNode?.removeChild(iframe) for insertion in @insertions
    @insertions = []
    @sandbox.destroy()
    super()

module.exports = IframeDeploymentStrategy
