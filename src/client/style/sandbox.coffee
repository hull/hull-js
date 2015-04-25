_              = require '../../utils/lodash'
ScopedCss      = require 'scopedcss/lib/';
ScopedCssRule  = require 'scopedcss/lib/cssRule';

StyleMap = [];
MergedStyles = null;

# https://github.com/cssstats/get-css
# getCss = require 'get-css'
# https://github.com/iadramelk/css-url-edit
# cssUrlEdit = require 'css-url-edit'
# https://github.com/bigpipe/async-asset
# asyncAsset = require 'async-asset'

getRules = (sheet)->
  sheet.cssRules || sheet.rules

emptySheet = (sheet)->
  return unless sheet?
  if sheet.deleteRule?
    sheet.deleteRule(0) while getRules(sheet).length > 0
  else if sheet.removeRule?
    sheet.removeRule(0) while getRules(sheet).length > 0

addCSSRule = (sheet, rule)->
  selector = rule.selectorText
  style = rule?.style?.cssText
  return unless sheet and style
  # and (!rule.type || rule.type==1)
  if sheet.insertRule?
    sheet.insertRule(rule.cssText,0)
  else if sheet.addRule?
    sheet.addRule(selector, style,0)

addRule = (sheet, rule={})->
  if sheet.insertRule?
    sheet.insertRule(rule.cssText,0)
  else if sheet.addRule? and rule?.style
    sheet.addRule(selector, rule.style,0)

processDocument = (prefix, doc)->

  # Create and initialize a new global styleshee tthat will receive merged styles in the right order
  unless MergedStyles
    MergedStyles = document.createElement('style')
    MergedStyles.setAttribute('id','hull-style')
    MergedStyles.appendChild(document.createTextNode("")); # Webkit Hack
    document.head.appendChild(MergedStyles)

  # Under Firefox, you can't change css Rules or the containing
  # style tag or those will be reset when touching anything else.
  # Resort to building an entirely new stylesheet without copying cssRules

  # Clear the Merged Styles
  emptySheet(MergedStyles.sheet)
  # IE doens't support inserting at any position.
  # Reverse stylesheets and insert from the end first.
  _.map _.toArray(doc.styleSheets).reverse(), (sheet)->
    _.map _.toArray(sheet.cssRules).reverse(), (rule)->
      # Manipulate insert Prefix here.
      selectorText = rule.selectorText?.split(',').map (r)->
        # Only replace if we haven't done it before first.
        r = r.replace(':host', prefix)
        if r.indexOf(prefix)>-1 then r else "#{prefix} #{r}"
      .join(', ')

      if selectorText
        style = rule.style.cssText
        addRule(MergedStyles.sheet, {selectorText:selectorText, cssText: "#{selectorText} {#{style}}", style: style})

processStyle = (prefix, node)->
  Array.prototype.slice.call(node.querySelectorAll('style:not([data-scoped])')).forEach (node)->
    node.setAttribute('data-scoped',true);
    new ScopedCss(prefix, null, node).process()
  # # Search for the node into already prefixed styles
  # n = _.findWhere StyleMap, {original : node}
  # # Prefix newly added styles
  # if !n or !n.scoped.processed 
  #   # Scope the stylesheet in place.
  #   scoped = new ScopedCss(prefix, null, node)
  #   n = {original:node, scoped:scoped}
  #   StyleMap.push(n)
  
  # n.scoped.process() if n
  # # Add dummy media query to make the browser ignore the style
  # # _.defer processStylesNow

removeStyle = (node)->
  # if node.nodeName=='STYLE'
  #   [removed, StyleMap] = _.partition StyleMap, (n)-> n.original == node || n.scoped == node
  #   _.defer processStylesNow


module.exports = {
  processDocument: processDocument
  processStyle: processStyle,
  removeStyle: removeStyle  
}
