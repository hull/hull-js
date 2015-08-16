_           = require '../../utils/lodash'
platform    = require 'html!./platform.html'
platformCss = require 'raw!inline-style!./platform.css'

banners = {
  platform: {
    html: platform,
    css: platformCss
  }
}

module.exports = (banner)->
  node = document.createElement('div');
  html = banners[banner]?.html
  css = banners[banner]?.css
  node.innerHTML = html

  for selector, style of css
    elements = node.querySelectorAll(selector)
    element.setAttribute('style', style) for element in elements

  a=node.getElementsByTagName('a');
  _.each a, (element)->
    intent = element.getAttribute('data-hull-intent')
    element.addEventListener 'click',(e)->
      e.stopPropagation()
      e.preventDefault()
      Hull.emit(intent)
  document.body.appendChild(node);
