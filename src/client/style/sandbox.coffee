_              = require '../../utils/lodash'
ScopedCss      = require 'scopedcss/lib/';
StyleMap = [];
MergedStyles = null

addCSSRule = (sheet, rule)->
  selector = rule.selectorText
  style = rule?.style?.cssText
  if style and (!rule.type || rule.type==1)
    if sheet.insertRule?
      sheet.insertRule(rule.cssText,0)
    else if sheet.addRule?
      sheet.addRule(selector, style,0)

processStylesNow = ()->
  if !MergedStyles

    MergedStyles = document.createElement('style')
    MergedStyles.setAttribute('custom','hull')
    # Webkit Hack
    MergedStyles.appendChild(document.createTextNode(""));

    document.head.appendChild(MergedStyles)


  cssRules = _.reduce StyleMap, (rules, n)->
    rules.concat(_.toArray(n.scoped.styleTag.sheet.cssRules))
  , []

  MergedStyles.innerHTML=""

  i = cssRules.length
  addCSSRule(MergedStyles.sheet, cssRules[i]) while i--

processStyles = _.debounce processStylesNow, 300

addStyle = (ship, sandbox, node)->
  if node.nodeName=='STYLE'
    n = _.findWhere StyleMap, {style : node}
    if !n
      prefix = sandbox ? ".ship-#{ship.id}" : ""
      node.parentNode && node.parentNode.removeChild(node)
      scoped = new ScopedCss(prefix, null, node.cloneNode(true))
      n = {style:node, scoped:scoped}
      StyleMap.push(n)
    n.scoped.process()
    if n.node
      n.node.innerHTML = ""
      _.map n.node.sheet.cssRules, (r)-> r.cssText = ""
  processStyles()

removeStyle = (node)->
  if node.nodeName=='STYLE'
    StyleMap = _.reject StyleMap, (n)-> n.node == node
  processStyles()


module.exports = {
  addStyle: addStyle,
  removeStyle: removeStyle  
}
