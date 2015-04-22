_              = require '../../utils/lodash'
styleSandbox   = require './sandbox'

processMutation = (ship, sandbox, mutations)->
  console.log "Mutation", mutations, sandbox
  _.map mutations, (mutation)->
    styleSandbox.addStyle(ship, sandbox, mutation.target)

    _.map mutation.addedNodes, (node)->
      styleSandbox.addStyle(ship, node)
      if node.nodeType==1
        _.map node.getElementsByTagName('style'), (n)-> styleSandbox.addStyle(ship, sandbox, n)

    _.map mutation.removedNodes, (node)->
      styleSandbox.removeStyle(ship, node)
      if node.nodeType==1
        _.map node.getElementsByTagName('style'), (n)-> styleSandbox.removeStyle(ship, n)

class StyleObserver
  constructor : (container, ship, sandbox)->
    @observer = new MutationObserver processMutation.bind(@, ship, sandbox)
    @observer.observe container, {
      subtree:true,
      childList: true,
      characterData: false,
      attributes: false,
      attributeOldValue: false
    }


module.exports = StyleObserver
