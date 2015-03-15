_            = require './lodash'

# Returns Link in either data-hull-link='...' or a href='...'
findLink = (node)->
  n.dataset?.hullLink || (n.nodeName=='A' && n.href)

# Returns a Meta Tag
getMetaValue = (name)->
  metas = document.getElementsByTagName('meta');
  meta = _.find metas, (meta)-> meta.property==name || meta.name==name
  return unless meta?
  meta.content

# Returns true if it is a DOM node
# http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object
isNode = (o)->
  if typeof Node == "object" then o instanceof Node else o and typeof o == "object" and typeof o.nodeType == "number" and typeof o.nodeName=="string"

getChildren = (n, skipMe)->
  r = []
  while n = n.nextSibling and n
     r.push n if n.nodeType == 1 and n != skipMe
  r

getSiblings = (n) ->
  getChildren n.parentNode.firstChild, n

module.exports = {
  getSiblings  : getSiblings
  getChildren  : getChildren
  getMetaValue : getMetaValue
  findLink     : findLink
  isNode       : isNode
} 
