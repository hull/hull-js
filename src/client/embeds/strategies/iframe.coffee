promises               = require '../../../utils/promises'
_                      = require '../../../utils/lodash'
BaseDeploymentStrategy = require './base'
Sandbox                = require '../sandbox'
throwErr               = require '../../../utils/throw'

class IframeDeploymentStrategy extends BaseDeploymentStrategy
  scopeStyles : false
  ignoredTags : ['#comment','SCRIPT']
  movedTags   : ['LINK', 'STYLE']

  ###*
   * Sandboxed : Multiple Iframes, one for each target, completely isolated
   * @return {promises} a promise that will resolve when all imports have been loaded in each iframe
  ###
  deploy: (targets)->
    @insertions = []
    @iframes = []

    # For each target, embed a new Iframe, that will in turn embed the Import
    readyPromises = _.map targets, (target)=>
      @iframes.push @embedIframe(target).then (iframe)=>
        el = null
        imprt = @embedImport(iframe)

        imprt.when.ready.then (doc)=>
          el = @cloneImport(doc)
          el.iframe = iframe
          d = iframe.contentDocument.createElement 'div'
          iframe.contentDocument.body.appendChild d
          d.appendChild el
          @addInsertion(el, iframe)
        .catch throwErr

        imprt.when.loaded.catch throwErr
        imprt.when.loaded

    promises.all(readyPromises)
  

  destroy: ()=>
    iframe.parentNode?.removeChild(iframe) for iframe in @iframes
    @sandbox.destroy()
    super()

module.exports = IframeDeploymentStrategy
