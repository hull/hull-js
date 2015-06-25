_        = require '../../utils/lodash'
findUrl  = require '../../utils/find-url'
assign      = require '../../polyfills/assign'
domWalker = require '../../utils/dom-walker'

to_qs = (params)->
  _.map params, (v,k) ->
    encodeURIComponent(k)+'='+encodeURIComponent(v)
  .join('&')

popup = (location, opts={}, params={})->
  return unless location?
  querystring = to_qs(params)
  share = window.open("#{location}?#{querystring}", 'hull_share', "location=0,status=0,width=#{opts.width},height=#{opts.height}")
  new Promise (resolve, reject)->
    interval = setInterval ->
      try
        if share == null || share.closed
          window.clearInterval(interval)
          resolve({})
       catch e
        reject(e)
    , 500


class Sharer

  constructor: (config)->
    @config = config

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
      platform_id: @config.appId
    }, opts.params)

    popupUrl = @config.orgUrl + "/api/v1/intent/share/" + opts.provider
    sharePromise = popup(popupUrl, { width: 550, height: 420 }, params)

    sharePromise.then (response)=>
      EventBus.emit("hull.#{opts.provider}.share", {params,response})
      response
    , (err)-> throw err


module.exports = Sharer
