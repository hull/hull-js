_ = require '../../utils/lodash'

fjs = document.getElementsByTagName("script")[0]

class Import
  constructor: (opts={})->
    {href, deploymentId, container} = opts

    @deploymentId = deploymentId
    @href = href

    if container
      @window   = container.contentWindow
      @document = container.contentDocument
    else
      @window   = window
      @document = document

    @ready = {}
    @ready.promise = new Promise (resolve, reject)=>
      @ready.resolve = resolve
      @ready.reject = reject

    @load = {}
    @load.promise = new Promise (resolve, reject)=>
      @load.resolve = resolve
      @load.reject = reject

    @when = {
      ready   : @ready.promise
      loaded  : @load.promise
    }

    @doImport()

  doImport : ()=>
    @el = @document.querySelector "link[rel=\"import\"][href=\"#{@href}\"]"

    unless @el
      @el = @document.createElement 'link'
      @el.rel = 'import'
      @el.href = @href
      @el.async = true #Will this break stuff ? if not - lets do it
      @document.getElementsByTagName('head')[0].parentNode.appendChild @el

    onReady = (doc)=>
      @el['import'].removeEventListener 'DOMContentLoaded', onReady
      ready = true
      @ready.resolve(@el['import'])

    # addEventListener doesnt work with IE 11 :(
    onLoad = (ev)=>
      ready=true
      @ready.resolve(@el['import'])
      @load.resolve(@el['import'].body)

    if @el['import'] && @el['import']?.body?
      @el['import'].deploymentId = @deploymentId
      onLoad()
    else
      @el.onload = onLoad
      importInterval = setInterval ()=>
        if @el['import']
          @el['import'].deploymentId = @deploymentId
          @el['import'].addEventListener 'DOMContentLoaded', onReady
          clearInterval(importInterval)
      , 10

    @el

  destroy : ()=>
    @el?.parentNode?.removeChild @el

module.exports = Import
