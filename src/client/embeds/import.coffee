_ = require '../../utils/lodash'

fjs = document.getElementsByTagName("script")[0]

class Import


  constructor: (opts={}, callback)->
    {href, sandbox} = opts
    if sandbox
      @window = sandbox.contentWindow
      @document = sandbox.contentDocument
    else
      @window = window
      @document = document

    @ensureSupport ()=>
      @doImport href, callback

  createLink   : ()=> @document.createElement 'link'
  createScript : ()=> @document.createElement 'script'

  doImport : (href, callback)=>
    el = @document.querySelector "link[rel=\"import\"][href=\"#{href}\"]"
    unless el
      el = @createLink()
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

  isSupported : ()=>
    return true if @_supported
    @createLink().hasOwnProperty 'import'

  ensureSupport: (cb)=>
    return cb() if @isSupported()
    return @_onReady.push(cb) if @_onReady
    @_onready = []
    @_onready.push cb
    @polyfill cb

  polyfill : (cb)=>
    lnk = @createLink()
    if !lnk.hasOwnProperty 'import'
      i = @createScript()
      i.src = "https://hull-js.s3.amazonaws.com/polyfills/HTMLImports.min.js"
      i.onload = () =>
        @_supported = true
        cb = @_onready.shift()
        while cb
          cb()
          cb = @_onready.shift()
      fjs.parentNode.insertBefore i, fjs

module.exports = Import
