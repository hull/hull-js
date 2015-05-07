_              = require '../../utils/lodash'
throwErr       = require '../../utils/throw'
ScopedCss      = require 'scopedcss/lib/';
ScopedCssRule  = require 'scopedcss/lib/cssRule';
superagent          = require 'superagent'

Styles     = []

CSS_URL_REGEXP = /(url\()([^)]*)(\))/g;
CSS_IMPORT_REGEXP = /(@import[\s]+(?!url\())([^;]*)(;)/g;
resolveUrlsInStyle= (style, linkUrl)->
  doc = style.ownerDocument
  resolver = doc.createElement("a")
  tc = getTextContent(style)
  setTextContent style, resolveUrlsInCssText(tc, linkUrl, resolver)
  style

resolveUrlsInCssText= (cssText, linkUrl, urlObj)->
  r = replaceUrls(cssText, urlObj, linkUrl, CSS_URL_REGEXP)
  r = replaceUrls(r, urlObj, linkUrl, CSS_IMPORT_REGEXP)
  r

replaceUrls= (text, urlObj, linkUrl, regexp)->
  text.replace regexp, (m, pre, url, post)->
    urlPath = url.replace(/["']/g, "")
    urlPath = new URL(urlPath, linkUrl).href if (linkUrl) 
    urlObj.href = urlPath
    urlPath = urlObj.href
    "#{pre}'#{urlPath}'#{post}"

resolveUrls = (text, href, doc)->
  resolver = doc.createElement("a")
  resolveUrlsInCssText(text, href, resolver);

# Those methods are there so we can handle IE8
getTextContent = (node)->
  return node.textContent if node.textContent?
  return node.innerText

setTextContent = (tag, content="")->
  if (tag.styleSheet) # for IE
    tag.styleSheet.cssText = content;
  else
    textnode = document.createTextNode(content);
    tag.appendChild(textnode);

createStyleSheet = (content, disabled=false)->
  style = document.createElement('style')
  style.disabled = true if disabled
  style.setAttribute("type", "text/css");
  style.setAttribute('id','hull-style')
  document.getElementsByTagName('head')[0].appendChild(style);
  # document.head.appendChild(style) -> IE8 incompatible
  setTextContent(style, content)
  style

removeStyleSheet = (style)->
  style.parentNode?.removeChild(style)

# Create and initialize a new global stylesheet that will receive merged styles in the right order
MergedStyles = createStyleSheet("") unless MergedStyles

# A single promise will guarantee execution order;
promise = new Promise (resolve, reject)-> resolve()

getRules = (sheet)->
  return unless sheet?
  sheet.cssRules || sheet.rules

fetch = (href)->
  new Promise (resolve, reject)->
    return reject() unless !!href
    superagent.get(href).end (err, res)->
      resolve(res.text)


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


textToRules = (text)->
  style = createStyleSheet(text, true)
  rules = getRules(style.sheet)
  removeStyleSheet(style)
  rules
prefixRules = (prefix, rules)->
  r = _.map rules, (rule)-> prefixRule(prefix, rule);
  r.join(' ');

appendText = (entry, text)->
  rules = textToRules(resolveUrls(text, entry.node.href, entry.doc))
  entry.style = prefixRules(entry.prefix, rules) if rules
  true

appendStyle = (entry)->
  if !!entry.node.href
    if entry.node.__importParsed
      # Polyfills go through here.
      # Skip links since we'll have them as Styles from the polyfill
      appendText(entry, entry.node.__resource)
    else
      # Chrome goes here
      # Loading External stylesheets (out of current domain)
      # Only Chrome will use this, since we have tweaked the Polyfill to avoid 2 requests.
      removeStyleSheet(entry.node)
      fetch(entry.node.href).then appendText.bind(this, entry)
  else
    resolveUrlsInStyle(entry.node)
    # Disable again to prevent infinite loops
    entry.node.disabled=true
    rules = getRules(entry.node.sheet)
    entry.style = prefixRules(entry.prefix, rules) if rules

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
    setTextContent MergedStyles, _.pluck(Styles,'style').join(' ');
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
  addSheet(prefix, node, node.ownerDocument)
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
