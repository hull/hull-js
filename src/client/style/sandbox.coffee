_              = require '../../utils/lodash'
ScopedCss      = require 'scopedcss/lib/';
ScopedCssRule  = require 'scopedcss/lib/cssRule';
superagent          = require 'superagent'

StyleMap = [];
MergedStyles   = null;
BufferedStyles = null;

rewriteCSSURLs = require('css-url-rewriter')

createStyleSheet = (content="", disabled=false)->
  style = document.createElement('style')
  style.disabled = true if disabled
  style.setAttribute('id','hull-style')
  style.appendChild(document.createTextNode(content)); # Webkit Hack
  document.head.appendChild(style)
  style

removeStyleSheet = (style)->
  style.parentNode?.removeChild(style)

getRules = (sheet)->
  sheet.cssRules || sheet.rules

empty = (sheet)->
  if sheet.deleteRule?
    sheet.deleteRule(0) while getRules(sheet).length > 0
  else if sheet.removeRule?
    sheet.removeRule(0) while getRules(sheet).length > 0

fetch = (href)->
  new Promise (resolve, reject)->
    superagent.get(href).end (err, res)-> resolve(res.text)

replaceRule = (sheet, selector, cssText, index)->
    if sheet.removeRule then sheet.removeRule(index) else sheet.deleteRule(index);
    rule = if selector then selector + '{' + cssText + '}' else cssText
    if sheet.addRule then sheet.addRule(selector, cssText, index) else sheet.insertRule(rule, index);

urlMatcher = /url\(\s*['"]?([^)'"]+)['"]?\s*\)/g;

prefixRule = (prefix, sheet, rule, index)->
  return unless rule and sheet
  if rule.selectorText
    # Manipulate insert Prefix here.
    selectorText = rule.selectorText?.split(',').map (r)->
      # Only replace if we haven't done it before first.
      r = r.replace(':host', prefix)
      if r.indexOf(prefix)>-1 then r else "#{prefix} #{r}"
    .join(', ')
    "#{selectorText} {#{rule.style.cssText}}"
  else
    subSheet = rule.cssRules || rule.rules
    if subSheet
      prefixRule(prefix, rule, subRule, j) for subRule, j in subSheet
    rule.cssText

appendStyle = (prefix, sheet, uri=window.location.href)->
  uri = getUriFromHref(sheet.href || uri)
  if !!sheet.href and !(sheet.cssRules || sheet.rules)
    # Loading External stylesheets (out of current domain)
    href = sheet.href
    sheet.ownerNode.parentNode.removeChild(sheet.ownerNode)
    fetch(href).then (text)->
      console.log "Loaded", href
      style = createStyleSheet(replaceLinkTagUrls(uri, text), true)
      appendRules sheet.cssRules, uri
      removeStyleSheet(style)
      true
  else
    rules = sheet.cssRules || sheet.rules
    appendRules(rules, uri)

replaceLinkTagUrls = (uri, text)->
  re = new RegExp "url\\(['\"]?([^)]*?)['\"]?\\)", "g"
  text.replace(re, "url('#{uri}$1')")

appendRules = (rules, uri)->
  _.map _.toArray(rules).reverse(), (rule)->
    cssText = rule.cssText
    BufferedStyles.sheet.insertRule(rule.cssText, 0)
  true

getUriFromHref = (href)->
  uri = href.split('/')
  uri.pop()
  uri.join('/')+'/'

addLink = (prefix, node)->
  appendStyle(prefix, node.sheet, getUriFromHref(node.href))

###*
 * Processes a complete document and writes a merged, prefixed stylesheet into the Main Document's HEAD.
 * @param  {string} prefix prefix to add to every style
 * @param  {[type]} doc    document to collapse into a single Stylesheet
###
processDocument = (prefix, doc)->
  # Create and initialize a new global stylesheet that will receive merged styles in the right order
  MergedStyles = createStyleSheet("") unless MergedStyles
  BufferedStyles = createStyleSheet("") unless BufferedStyles
  BufferedStyles.disabled=true

  # Under Firefox, you can't change css Rules or the containing
  # style tag or those will be reset when touching anything else.
  # Resort to building an entirely new stylesheet without copying cssRules

  # Clear the Merged Styles
  empty(BufferedStyles.sheet)

  # Promise manipulation ensures stylesheets are loaded in the correct order even if they are async.
  promise = new Promise (resolve, reject)-> resolve()

  # IE doens't support inserting at any position.
  # Reverse stylesheets and insert from the end first.
  _.map doc.styleSheets, (sheet)->
    unless sheet.disabled
      sheet.disabled=true
      t = promise.then ()->
        o = appendStyle(prefix, sheet)
        console.log o
        o
      , (err)-> console.log err
      console.log t
      promise = t

  promise.then ()-> 
    for rule, i in BufferedStyles.sheet.cssRules
      cssText = prefixRule(prefix, BufferedStyles.sheet, rule, i);
      MergedStyles.sheet.insertRule(cssText, MergedStyles.sheet.cssRules.length)
    true

processStyle = (prefix, node)->
  Array.prototype.slice.call(node.querySelectorAll('style:not([data-scoped])')).forEach (node)->
    node.setAttribute('data-scoped',true);
    new ScopedCss(prefix, null, node).process()

module.exports = {
  processDocument: processDocument
  processStyle: processStyle,
  addLink: addLink,
}
