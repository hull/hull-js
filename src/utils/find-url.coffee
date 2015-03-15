assign       = require 'object-assign'
_            = require './lodash'
domWalker    = require './dom-walker'

getDOMUrl  = (sourceNode)->
  return unless domWalker.isNode(sourceNode)
  body = document.body
  node = sourceNode
  while node != body
    node = node.parentNode

    # Find link on self
    link = domWalker.findLink(node)

    # or, find first link from siblings
    link ||= _.find domWalker.getSiblings(node), domWalker.findLink

    # If we found something, return.
    return link if link?

getPageUrl = ()->
  window.location.href

getOGUrl = ()->
  domWalker.getMetaValue('og:url')

module.exports = (node)-> getDOMUrl(node) || getOGUrl() || getPageUrl()
