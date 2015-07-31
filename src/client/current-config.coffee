_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
clone    = require '../utils/clone'
throwErr = require '../utils/throw'
assign   = require '../polyfills/assign'
Promise  = require('es6-promise').Promise
getKey   = require '../utils/get-key'

getRemoteUrl = (config)->
  url = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{VERSION}"
  url += "&r=#{encodeURIComponent(document.referrer)}"
  url += "&js=#{config.jsUrl}"  if config.jsUrl
  url += "&uid=#{config.uid}"   if config.uid
  url += "&debug_remote=true"   if config.debugRemote
  url += "&access_token=#{config.accessToken}" if config.accessToken?
  url += "&user_hash=#{config.userHash}" if config.userHash != undefined
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


class CurrentConfig

  constructor: ()->

  init: (config)->
    # # Init is silent
    # @_clientConfig = config
    @_remoteConfig = {}
    @_clientConfig = {}

    checkConfig(config).then (config)=>
      @_clientConfig = config
      @
    , throwErr

  initRemote: (hash)->
    @_remoteConfig = hash


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
    getRemoteUrl(@_clientConfig)


  onUpdate : () =>
    EventBus.emit('hull.config.update', @get())


module.exports = CurrentConfig
