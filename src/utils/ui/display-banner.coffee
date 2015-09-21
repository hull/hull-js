_           = require '../../utils/lodash'
platform    = require 'html!./platform.html'
captcha     = require 'html!./captcha.html'

platformCss = require 'raw!inline-style!./platform.css'

banners =
  platform:
    html: platform,
    css: platformCss
  captcha:
    html: captcha
    css: platformCss

module.exports = (banner, root = document.body)->
  node = document.createElement('div');
  html = banners[banner]?.html
  css = banners[banner]?.css
  node.innerHTML = html

  for selector, style of css
    elements = node.querySelectorAll(selector)
    element.setAttribute('style', style) for element in elements

  a = node.getElementsByTagName('a')
  _.each a, (element)->
    intent = element.getAttribute('data-hull-intent')
    element.addEventListener 'click',(e)->
      e.stopPropagation()
      e.preventDefault()
      Hull.emit(intent)

  root.appendChild(node) if root

  node
