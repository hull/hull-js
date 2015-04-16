_ = require '../../utils/lodash'

fjs = document.getElementsByTagName("script")[0]

class Import


  constructor: (opts={}, readyCallback, loadCallback)->
    {href, container} = opts
    if container
      @window = container.contentWindow
      @document = container.contentDocument
    else
      @window = window
      @document = document
    readyCallback ||= ()->
    loadCallback  ||= ()->
    @doImport href, readyCallback, loadCallback


  doImport : (href, readyCallback, loadCallback)=>
    el = @document.querySelector "link[rel=\"import\"][href=\"#{href}\"]"
    unless el
      el = @document.createElement 'link'
      el.rel = 'import'
      el.href = href
      el.async = true #Will this break stuff ? if not - lets do it
      @document.getElementsByTagName('head')[0].parentNode.appendChild el
    if el?.import?.body and el?.import?.head?
      readyCallback(el)
      loadCallback(el)
    else
      ready=false
      loadInterval = setInterval ()->
        if el.import?
          clearInterval(loadInterval)
          doc = el?.import
          rsInterval = setInterval ()->
            if(doc?.body && doc.head)
              clearInterval(rsInterval)
              readyCallback(doc) unless ready
              ready = true
          , 10
      , 10

      el.addEventListener 'load', (ev)=>
        onEmbed = el.import.onEmbed || ->
        readyCallback(el.import) unless ready
        ready=true
        loadCallback(onEmbed)
    el

module.exports = Import
