_              = require '../../utils/lodash'
throwErr       = require '../../utils/throw'
ScopedCss      = require 'scopedcss/lib/';
ScopedCssRule  = require 'scopedcss/lib/cssRule';
superagent          = require 'superagent'

Styles     = []


createStyleSheet = (content="", disabled=false)->
  style = document.createElement('style')
  style.disabled = true if disabled
  style.setAttribute('id','hull-style')
  style.appendChild(document.createTextNode(content)); # Webkit Hack
  document.head.appendChild(style)
  style

removeStyleSheet = (style)-> style.parentNode?.removeChild(style)

# Create and initialize a new global stylesheet that will receive merged styles in the right order
MergedStyles = createStyleSheet("") unless MergedStyles

# A single promise will guarantee execution order;
promise = new Promise (resolve, reject)-> resolve()

getRules = (sheet)->
  return unless sheet?
  sheet.cssRules || sheet.rules
appendRules = (entry, rules)->
  r = _.map rules, (rule)->
    prefixRule(entry.prefix, rule);
  entry.style = r.join(' ');
  true
empty = (sheet)->
  if sheet.deleteRule?
    sheet.deleteRule(0) while getRules(sheet).length > 0
  else if sheet.removeRule?
    sheet.removeRule(0) while getRules(sheet).length > 0
fetch = (href)->
  new Promise (resolve, reject)->
    superagent.get(href).end (err, res)-> resolve(res.text)
replaceLinkTagUrls = (uri, text)->
  re = new RegExp "url\\(['\"]?([^)]*?)['\"]?\\)", "g"
  text.replace(re, "url('#{uri}$1')")
prefixRule = (prefix, rule)->
  return unless rule
  if rule.selectorText
    # Manipulate insert Prefix here.
    selectorText = rule.selectorText?.split(',').map (r)->
      # Only replace if we haven't done it before first.
      r = r.replace(':host', prefix)
      if r.indexOf(prefix)>-1 then r else "#{prefix} #{r}"
    .join(', ')
    return "#{selectorText} {#{rule.style.cssText}} "
  else
    subSheet = rule.cssRules || rule.rules
    return rule.cssText unless subSheet
    content = (prefixRule(prefix, subRule) for subRule, j in subSheet)
    query = rule.cssText.split('{');
    return "#{query[0]} {#{content.join(' ')}} "
getUriFromHref = (href)->
  uri = href.split('/')
  uri.pop()
  uri.join('/')+'/'

appendStyle = (entry)->
  rules = getRules(entry.node.sheet)
  if rules
    appendRules(entry, rules) if rules
  else if !!entry.node.href
    # Loading External stylesheets (out of current domain)
    # Only Chrome will use this, since we have tweaked the Polyfill to avoid 2 requests.
    href = entry.node.href
    uri = getUriFromHref(entry.node.href)
    entry.node.parentNode.removeChild(entry.node)
    fetch(href).then (text)->
      style = createStyleSheet(replaceLinkTagUrls(uri, text), true)
      rules = getRules(style.sheet)
      appendRules(entry, rules)
      removeStyleSheet(style)
      true
addSheet = (prefix, node, doc)->
  entry = findNode(prefix, node)
  unless entry
    entry = {prefix: prefix, node:node, doc:doc, style:""}
    Styles.push(entry)
  unless node.disabled
    node.disabled=true
    promise = promise.then ()->
      appendStyle(entry)
    ,throwErr


# findDoc = (prefix, doc)->
#   _.find Styles, (d)-> d.doc==doc && d.prefix == prefix

findNode = (prefix, node)->
  _.find Styles, (d)-> d.node==node && d.prefix == prefix

finalize = ()->
  promise.then ()->
    MergedStyles.textContent = _.pluck(Styles,'style').join(' ');
  , throwErr

###*
 * Adds a whole document's styles to the Styles tag
 * 
 * Under Firefox, you can't change css Rules or the containing
 * style tag or those will be reset when touching anything else.
 * Resort to building an entirely new stylesheet without copying cssRules
 * @param {[type]} prefix [description]
 * @param {[type]} doc    [description]
###
addDocument = (prefix, doc)->
  styles = _.toArray(doc.querySelectorAll('style,link'))
  addSheet(prefix, node, doc) for index, node of styles
  finalize()

removeDocument = (prefix, doc)->
  Styles = _.omit Styles, (style)-> style.doc == doc
  finalize()

addStyle = (prefix, node)->
  # Array.prototype.slice.call(node.querySelectorAll('style:not([data-scoped])')).forEach (node)->
  node.setAttribute('data-scoped',true);
  new ScopedCss(prefix, null, node).process()

addLink = (prefix, node)->
  addSheet(prefix, node)
  finalize()

removeLink = (node)->
  Styles = _.omit Styles, (style)-> style.node == node
  finalize()



module.exports = {
  addDocument    : addDocument
  removeDocument : removeDocument
  addStyle       : addStyle
  addLink        : addLink
}
