_              = require '../../utils/lodash'
throwErr       = require '../../utils/throw'
ScopedCss      = require 'scopedcss/lib/';
ScopedCssRule  = require 'scopedcss/lib/cssRule';
superagent          = require 'superagent'

Styles     = {}
MergedStyles  = null;

# replaceRule = (sheet, selector, cssText, index)->
#     if sheet.removeRule then sheet.removeRule(index) else sheet.deleteRule(index);
#     rule = if selector then selector + '{' + cssText + '}' else cssText
#     if sheet.addRule then sheet.addRule(selector, cssText, index) else sheet.insertRule(rule, index);

createStyleSheet = (content="", disabled=false)->
  style = document.createElement('style')
  style.disabled = true if disabled
  style.setAttribute('id','hull-style')
  style.appendChild(document.createTextNode(content)); # Webkit Hack
  document.head.appendChild(style)
  style

removeStyleSheet = (style)-> style.parentNode?.removeChild(style)

getRules = (sheet)->
  return unless sheet?
  sheet.cssRules || sheet.rules

empty = (sheet)->
  if sheet.deleteRule?
    sheet.deleteRule(0) while getRules(sheet).length > 0
  else if sheet.removeRule?
    sheet.removeRule(0) while getRules(sheet).length > 0

fetch = (href)->
  new Promise (resolve, reject)->
    superagent.get(href).end (err, res)-> resolve(res.text)

appendStyle = (prefix, node, uri=window.location.href)->
  rules = getRules(node.sheet)
  if rules
    appendRules(prefix, rules) if rules
  else if !!node.href
    # Loading External stylesheets (out of current domain)
    # Only Chrome will use this, since we have tweaked the Polyfill to avoid 2 requests.
    href = node.href
    uri = getUriFromHref(node.href || uri)
    node.parentNode.removeChild(node)
    fetch(href).then (text)->
      style = createStyleSheet(replaceLinkTagUrls(uri, text), true)
      rules = getRules(style.sheet)
      appendRules(prefix, rules)
      removeStyleSheet(style)
      true

replaceLinkTagUrls = (uri, text)->
  re = new RegExp "url\\(['\"]?([^)]*?)['\"]?\\)", "g"
  text.replace(re, "url('#{uri}$1')")

appendRules = (prefix, rules)->
  _.map rules, (rule)->
    Styles[prefix].style += prefixRule(prefix, rule);
  true

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

addLink = (prefix, node)->
  appendStyle(prefix, node, getUriFromHref(node.href))

promise = new Promise (resolve, reject)-> resolve()

###*
 * Processes a complete document and writes a merged, prefixed stylesheet into the Main Document's HEAD.
 * @param  {string} prefix prefix to add to every style
 * @param  {[type]} doc    document to collapse into a single Stylesheet
###
processDocument = (prefix, doc)->
  # Promise manipulation ensures stylesheets are loaded in the correct order even if they are async.
  styles = _.toArray(doc.querySelectorAll('style,link'))
  # IE doesn't support inserting at any position.
  # Reverse stylesheets and insert from the end first.
  _.map styles, (style)->
    unless style.disabled
      style.disabled=true
      promise = promise.then ()->
        appendStyle(prefix, style)
      , (err)-> console.log err.message, err.stack

  promise.then ()->
    MergedStyles.textContent = _.pluck(Styles,'style').join(' ');
  , throwErr


addDocument = (prefix, doc)->
  # Create and initialize a new global stylesheet that will receive merged styles in the right order
  MergedStyles = createStyleSheet("") unless MergedStyles
  # Under Firefox, you can't change css Rules or the containing
  # style tag or those will be reset when touching anything else.
  # Resort to building an entirely new stylesheet without copying cssRules
  Styles[prefix] = {doc: doc, style:""}
  processDocument(prefix, hash.doc) for prefix, hash of Styles

addStyle = (prefix, node)->
  # Array.prototype.slice.call(node.querySelectorAll('style:not([data-scoped])')).forEach (node)->
  node.setAttribute('data-scoped',true);
  new ScopedCss(prefix, null, node).process()

module.exports = {
  addDocument : addDocument
  addStyle    : addStyle
  addLink     : addLink
}
