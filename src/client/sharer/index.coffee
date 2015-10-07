_         = require '../../utils/lodash'
findUrl   = require '../../utils/find-url'
assign    = require '../../polyfills/assign'
domWalker = require '../../utils/dom-walker'
qs        = require '../../utils/query-string-encoder'
EventBus  = require '../../utils/eventbus'

popup = (location, opts={}, params={})->
  return unless location?
  share = window.open("#{location}?#{qs.encode(params)}", 'hull_share', "location=0,status=0,width=#{opts.width},height=#{opts.height}")
  new Promise (resolve, reject)->
    interval = setInterval ->
      try
        if !share? || share.closed
          window.clearInterval(interval)
          resolve({})
       catch e
        reject(e)
    , 500


class Sharer

  constructor: (currentConfig)->
    @currentConfig = currentConfig

  share: (opts, event={})=>
    if !_.isObject(opts)
      throw new Error("You need to pass an options hash to the share method. You passed: #{JSON.stringify(opts)}")
    else if !opts.provider?
      throw new Error("You need specify the provider on which to share. You passed: #{opts.provider}")
    else if !_.isObject(opts.params)
      opts.params = {}
      # throw new Error("You need specify some parameters to pass the provider. You passed: #{opts.params}")

    opts.params ||= {}
    # If the Sharing URL is not specified, then walk up the DOM to find some URL to share.
    # If No url is specified, will walk up to window.location.href.
    #
    # Lookup Order
    # 1. Passed-in url
    # 2. Find url from Click Targt
    # 3. Ship container node

    opts.params.url = opts.params.url || opts.params.href

    if (!opts.params.url)
      opts.params.url = findUrl(event.target)
      opts.params.title = opts.params.title || domWalker.getMetaValue('og:title') || document.title

    params = assign({
      platform_id: @currentConfig.get('appId')
    }, opts.params)

    provider = opts.provider

    popupUrl = @currentConfig.get('orgUrl') + "/api/v1/intent/share/" + opts.provider
    sharePromise = popup(popupUrl, { width: 550, height: 420 }, params)

    sharePromise.then (response)=>
      data = assign({ url: opts.params.url }, params, { provider })
      EventBus.emit("hull.#{opts.provider}.share", data)
      assign({}, data, { response })
    , (err)-> throw err


module.exports = Sharer
