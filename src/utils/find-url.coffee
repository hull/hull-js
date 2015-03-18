assign       = require 'object-assign'
_            = require './lodash'
domWalker    = require './dom-walker'

getDOMUrl = (sourceNode)->
  return unless domWalker.isNode(sourceNode)
  body = document.body
  node = sourceNode
  while node and node != body
    # Find link on self
    # or find first link from siblings
    link = domWalker.getLinkValue(node)
    unless link
      matchingNode = _.find(domWalker.getSiblings(node), domWalker.getLinkValue)
      link =  domWalker.getLinkValue matchingNode

    # If we found something, return.
    return link if link?

    # Else, walk up
    node = node.parentNode

getPageUrl = ()->
  window.location.href

getOGUrl = ()->
  domWalker.getMetaValue('og:url')

module.exports = (node)->
  u = getDOMUrl(node) || getOGUrl() || getPageUrl()
  u.replace(/[#\/]*$/, '')

