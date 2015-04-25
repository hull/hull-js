_              = require '../../utils/lodash'
styleSandbox   = require './sandbox'

observerOptions = 
  subtree          : true
  childList        : true
  characterData    : false
  attributes       : false
  attributeOldValue: false

hasStyleMutation = (mutations) ->
  _.some mutations, (m)->
    return true if m.target.nodeName == 'STYLE' 
    return _.some m.addedNodes,   'nodeName', 'STYLE'
    return _.some m.addedNodes,   (node)->!!node.getElementsByTagName('style').length
    return _.some m.removedNodes, 'nodeName', 'STYLE'
    return _.some m.removedNodes, (node)->!!node.getElementsByTagName('style').length
    false

processDocumentMutation = (prefix, doc, mutations)->
  styleSandbox.processDocument(prefix, doc) if hasStyleMutation(mutations)

# Collect all style mutations in the mutation batch, and add / remove them
processNodeMutation = (prefix, mutations)->
  _.map mutations, (mutation)->
    if mutation.target.nodeType == 1
      unless mutation.target.nodeName == 'STYLE'
        styleSandbox.processStyle(prefix, mutation.target)
        # _.map _.filter(mutation.addedNodes, {nodeType:1}), (node)->
        #   if node.nodeName=='STYLE'
        #     styleSandbox.processStyle(prefix, node)
        #   else
        #     _.map node.getElementsByTagName('style'), (n)-> styleSandbox.processStyle(prefix, n)

        # _.map _.filter(mutation.removedNodes, {nodeType:1}), (node)->
        #   if node.nodeName == 'STYLE'
        #     styleSandbox.removeStyle(node)
        #   else
        #     _.map node.getElementsByTagName('style'), (n)-> styleSandbox.removeStyle(n)

class StyleObserver
  constructor : (prefix)->
    @_observers = []
    @prefix = prefix

  observeNode: (node)->
    return unless node

    # Do it once at the beginning to ensure we catch what's already in there.
    _.map node.querySelectorAll('style'), styleSandbox.processStyle.bind(@, @prefix)

    # Observe for future changes
    observer = new MutationObserver processNodeMutation.bind(@, @prefix)
    observer.observe node, observerOptions
    @_observers.push({root:node, observer: observer})
    observer

  observeDocument: (doc)->
    return unless doc

    # Do it once at the beginning to ensure we catch what's already in there.
    styleSandbox.processDocument @prefix, doc

    # Observe for future changes
    observer = new MutationObserver processDocumentMutation.bind(@, @prefix, doc)
    observer.observe doc.head, observerOptions
    observer.observe doc.body, observerOptions
    @_observers.push({root:doc, observer: observer})
    observer

  unobserve : (root)->
    observer = _.findWhere @_observers, {root}
    observer.observer.disconnect()

module.exports = StyleObserver
