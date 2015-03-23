_ = require '../../utils/lodash'

fjs = document.getElementsByTagName("script")[0]

require './shims/event'
require './shims/xhr-xdr'
require './shims/webcomponents'

class Import


  constructor: (opts={}, callback)->
    {href, sandbox} = opts
    if sandbox
      @window = sandbox.contentWindow
      @document = sandbox.contentDocument
    else
      @window = window
      @document = document

    @doImport href, callback


  doImport : (href, callback)=>
    el = @document.querySelector "link[rel=\"import\"][href=\"#{href}\"]"
    unless el
      el = @document.createElement 'link'
      el.rel = 'import'
      el.href = href
      el.async = true #Will this break stuff ? if not - lets do it
      @document.getElementsByTagName('head')[0].parentNode.appendChild el
    if  _.isFunction callback
      if el.import
        callback el
      else
        el.addEventListener 'load', (ev)=>
          callback ev.target
    el

module.exports = Import
