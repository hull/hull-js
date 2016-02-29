Promise  = require 'bluebird'
_        = require '../../utils/lodash'
logger   = require '../../utils/logger'

fjs = document.getElementsByTagName("script")[0]

class Import
  constructor: (opts={})->
    {href, shipId, container, scoped} = opts

    @shipId = shipId
    protocol = document.location.protocol
    @href = href.replace(/^https?:/,protocol)
    @scoped = scoped

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
      @el.setAttribute('scoped', @scoped) if !!@scoped
      @el.rel = 'import'
      @el.href = @href
      @el.async = true #Will this break stuff ? if not - lets do it
      @document.getElementsByTagName('head')[0].appendChild @el


    onReady = (doc)=>
      unless ready
        logger.verbose("Import #{@href} Ready")
        @el['import'].removeEventListener 'DOMContentLoaded', onReady
        ready = true
        @ready.resolve(@el['import'])

    # addEventListener doesnt work with IE 11 :(
    onLoad = (ev)=>
      onReady()
      logger.verbose("Import #{@href} Loaded")
      @el.removeEventListener 'load', onLoad
      @load.resolve(@el['import'].body)

    if @el['import'] && @el['import']?.body?
      @el['import'].shipId = @shipId
      onLoad()
    else
      @el.addEventListener 'load', onLoad
      importInterval = setInterval ()=>
        if @el['import']
          @el['import'].shipId = @shipId
          # TODO : SetTimeout to have an error when import doesnt load.
          @el['import'].addEventListener 'DOMContentLoaded', onReady
          clearInterval(importInterval)
      , 10

    @el

  destroy : ()=>
    @el?.parentNode?.removeChild @el

module.exports = Import
