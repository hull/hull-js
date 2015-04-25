BaseDeploymentStrategy = require './base'
Sandbox  = require '../sandbox'

class ScopeDeploymentStrategy extends BaseDeploymentStrategy
  ###*
   * Scoped : One hidden Iframe holds JS and Style, callback method called for each target
   * @return {promise} A promise for when the import is loaded inside the iframe
  ###
  deploy: (targets)->
    @embedIframe().then (iframe)=>
      sandbox = new Sandbox(@ship, @, true, iframe)
      imprt = @embedImport(iframe)
      elements = []
      imprt.ready.then (imprt)=>
        _.map targets, (target)=>
          elements.push(@insert(imprt.el.cloneNode(true), target))
      .done()

      imprt.load.then ()=>
        sandbox.addElement(element) for element in elements
        sandbox.boot()
        @dfd.resolve()
    .done()
    @dfd.promise

module.exports = ScopeDeploymentStrategy
