localstorage = require('putainde-localstorage')
_            = require '../utils/lodash'
EventBus     = require '../utils/eventbus'
clone        = require '../utils/clone'
cookies      = require '../utils/cookies'
throwErr     = require '../utils/throw'
Base64       = require '../utils/base64'
assign       = require '../polyfills/assign'
Promise      = require('es6-promise').Promise
getKey       = require '../utils/get-key'

getReferralContext = ->
  {
    initial_url: document.location.href,
    initial_referrer: document.referrer || '$direct',
    initial_referring_domain: extractDomainFromUrl(document.referrer) || '$direct',
    initial_utm_tags: extractUtmTags(),
    first_seen_at: new Date().getTime()
  }

getRemoteUrl = (config, identifiers)->
  url = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{VERSION}"
  url += "&r=#{encodeURIComponent(document.referrer)}"
  url += "&js=#{config.jsUrl}"  if config.jsUrl
  url += "&uid=#{config.uid}"   if config.uid
  url += "&debug_remote=true"   if config.debugRemote
  url += "&access_token=#{config.accessToken}" if config.accessToken?
  url += "&user_hash=#{config.userHash}" if config.userHash != undefined
  url += "&_bid=#{identifiers.bid}" if identifiers?.bid
  url += "&_sid=#{identifiers.sid}" if identifiers?.sid
  url

# Parse the tracked events configuration and standardize it.
formatTrackConfig = (config={})->
  switch (Object.prototype.toString.call(config).match(/^\[object (.*)\]$/)[1])
    when "Object"
      if config.only?
        config = { only: (m.toString() for m in config.only) }
      else if config.ignore?
        config = { ignore: (m.toString() for m in config.ignore) }
      else
        config
    when "RegExp"
      config = { only: config.toString() }
    when "Array"
      config = { only: (m.toString() for m in config)  }
  # Setup initial referrer
  config.referrer = document.referrer if document?.referrer
  config

checkConfig = (config)->
  config = clone(config)
  config.track  = formatTrackConfig(config.track)
  promise = new Promise (resolve, reject)=>
    msg = "You need to pass some keys to Hull to start it: "
    readMore = "Read more about this here : http://www.hull.io/docs/references/hull_js/#hull-init-params-cb-errb"
    # Fail right now if we don't have the required setup
    if config.orgUrl and config.appId
      # Auto add protocol if we dont have one of http://, https://, //
      reject(new Error(" You specified orgUrl as #{config.orgUrl}. We do not support protocol-relative URLs in organization URLs yet.")) if config.orgUrl.match(/^\/\//)
      config.orgUrl ="https://#{config.orgUrl}" unless config.orgUrl.match(/^http[s]?:\/\//)
      resolve(config)
    else
      reject(new Error "#{msg} We couldn't find `orgUrl` in the config object you passed to `Hull.init`\n #{readMore}") unless config.orgUrl
      reject(new Error "#{msg} We couldn't find `platformId` in the config object you passed to `Hull.init`\n #{readMore}") unless config.appId
  promise.then(null, throwErr)
  promise

extractDomainFromUrl = (url)->
  return unless url && url.length
  u = url.match(/^(https?:\/\/)?([\da-z\.-]+)([\/\w \.-]*)*\/?/)
  u[2] if u

extractUtmTags = ->
  _.reduce document.location.search.slice(1).split('&'), (tags, t)->
    [k,v] = t.split('=', 2)
    tags[k.replace(/^utm_/, '')] = v if /^utm_/.test(k)
    tags
  , {}

class CurrentConfig

  constructor: ()->

  init: (config)->
    # # Init is silent
    # @_clientConfig = config
    @_remoteConfig = {}
    @_clientConfig = {}


    checkConfig(config).then (config)=>
      org = extractDomainFromUrl(config.orgUrl)
      ns = ['hull'].concat(org.split('.')).join('_')
      @storage = localstorage.create({ namespace: ns })
      @_clientConfig = config
      @
    , throwErr

  initRemote: (cfg={})->
    @identifyBrowser(cfg.identify.browser, count: true)
    @identifySession(cfg.identify.session, count: true)
    @_remoteConfig = cfg

  set: (config, key)->
    if key? then @_clientConfig[key] = config else @_clientConfig = config

  setSettings: ()->

  setRemote: (hash, key)->
    if(key)
      previousConfig = @_remoteConfig[key]
      @_remoteConfig[key] = assign({},@_remoteConfig[key],hash)
    else
      previousConfig = @_remoteConfig
      @_remoteConfig = assign({}, @_remoteConfig, hash)
    @onUpdate() unless _.isEqual(previousConfig, hash)


  get: (key)=>
    hash = clone(@_clientConfig);
    hash.services = clone(@_remoteConfig.services);
    getKey(hash, key)

  getRemote: (key)->
    getKey(@_remoteConfig, key)

  getRemoteUrl: ()=>
    browser = @identifyBrowser()
    session = @identifySession()
    getRemoteUrl(@_clientConfig, { bid: browser.id, sid: session.id })

  identifySession: (id, options={})=>
    @identify('session', id, assign({}, options, expires: 60 * 1000 * 30))


  identifyBrowser: (id, options={})=>
    @identify('browser', id, options)

  identify: (key, id, options={})=>
    ident = @storage.get(key)
    now = new Date().getTime()
    if options.expires
      # Auto expire after 30 minutes
      if !ident || ident.expires_at < now
        ident = getReferralContext()
      ident.expires_at = now + options.expires
    else
      ident ?= getReferralContext()
    ident.id = id if id?

    if options.count
      ident.inits_count = (ident.inits_count || 0) + 1

    try @storage.set(key, ident)

    ident

  onUpdate : () =>
    EventBus.emit('hull.config.update', @get())


module.exports = CurrentConfig
