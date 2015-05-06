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

    if @el.import && @el.import?.body?
      @el.import.deploymentId = @deploymentId
      @ready.resolve(@el.import)
      @load.resolve(@el.import.body)
    else
      loadInterval = setInterval ()=>
        if @el.import
          @el.import.deploymentId = @deploymentId
          clearInterval(loadInterval)
          rsInterval = setInterval ()=>
            if(@el.import.body)
              clearInterval(rsInterval)
              @ready.resolve(@el.import)
              ready = true
          , 10
      , 10

      # addEventListener doesnt work with IE 11 :(
      @el.onload = (ev)=>
        @ready.resolve(@el.import)
        ready=true
        @load.resolve(@el.import.body)
    @el

  destroy : ()=>
    @el?.parentNode?.removeChild @el

module.exports = Import
