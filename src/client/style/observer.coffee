_              = require '../../utils/lodash'
styleSandbox   = require './sandbox'

observerOptions = 
  subtree          : true
  childList        : true
  characterData    : false
  attributes       : false
  attributeOldValue: false

isStyleTag      = (node)-> node.nodeType == 1 && node.nodeName == 'STYLE'
isLinkSheet     = (node)-> node.nodeType == 1 && node.nodeName=='LINK' && node.getAttribute('rel')=='stylesheet'

hasLinkSheet    = (node)-> node.nodeType == 1 && !!node.getElementsByTagName('link[rel=stylesheet]').length
hasStyleTag     = (node)-> node.nodeType == 1 && !!node.getElementsByTagName('style').length

isOrHasStyleTag = (node)-> isStyleTag(node)  || hasStyleTag(node)
isOrHasLinkSheet= (node)-> isLinkSheet(node) || hasLinkSheet(node)

getStyles         = (node)->
  return [] if node.nodeType != 1
  return [node] if isStyleTag(node)
  return node.querySelectorAll('style')

getLinks = (node)->
  return [] if node.nodeType != 1
  return [node] if isLinkSheet(node)
  return node.querySelectorAll('link[rel=stylesheet]')

hasStyleMutations = (mutations) ->
  _.some mutations, (m)->
    return true if isStyleTag(m.target) or isLinkSheet(m.target)
    return _.some m.addedNodes,   isOrHasStyleTag
    return _.some m.removedNodes, isOrHasStyleTag
    return _.some m.addedNodes,   isOrHasLinkSheet
    return _.some m.removedNodes, isOrHasLinkSheet
    false

processDocumentMutations = (prefix, doc, mutations)->
  if hasStyleMutations(mutations)
    styleSandbox.processDocument(prefix, doc)

# Collect all style mutations in the mutation batch, and add / remove them
processNodeMutations = (prefix, mutations)->
  _.map mutations, (mutation)->
    # Style mutations don't interest us for now. we just skip them
    # return styleSandbox.addStyle(prefix, mutation.target) if isStyleTag(mutation.target)

    # Can't be a style and also have addedNodes...
    _.map mutation.addedNodes, (node)->
      styleSandbox.addStyle(prefix, style) for style in getStyles(node)

class StyleObserver
  constructor : (prefix)->
    @_observers = []
    @prefix = prefix

  observe : (target)->
    @observeDocument(target) if target.nodeType==9 # document
    @observeNode(target)     if target.nodeType==1 # node

  process : (target)->
    @processDocument(target) if target.nodeType==9 # document
    @processNode(target)     if target.nodeType==1 # node
      

  processNode : (node)->
    _.map node.querySelectorAll('style'), styleSandbox.addStyle.bind(@, @prefix)
    
  observeNode: (node)->
    return unless node

    # Do it once at the beginning to ensure we catch what's already in there.
    @processNode(node)

    # Observe for future changes
    observer = new MutationObserver processNodeMutations.bind(@, @prefix)
    observer.observe(node, observerOptions)
    @_observers.push({root:node, observer: observer})
    observer

  processDocument : (doc)->
    styleSandbox.processDocument @prefix, doc

  observeDocument: (doc)->
    return unless doc

    # Only useful for Native HTML imports. Polyfills put link tags in the main DOM
    # _.map doc.querySelectorAll('link[rel=stylesheet]'), styleSandbox.processLink.bind(@, @prefix)

    # Do it once at the beginning to ensure we catch what's already in there.
    @processDocument(doc)

    # Observe for future changes
    observer = new MutationObserver processDocumentMutations.bind(@, @prefix, doc)
    observer.observe(doc.head, observerOptions)
    observer.observe(doc.body, observerOptions)
    @_observers.push({root:doc, observer: observer})
    observer

  unobserve : (root)->
    observer = _.find @_observers, (obs)->obs.root==root
    observer.observer.disconnect()

module.exports = StyleObserver
