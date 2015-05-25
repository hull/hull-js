Promise  = require('es6-promise').Promise
xdm      = require 'xdm.js'
domready = require '../utils/domready'
_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
logger   = require '../utils/logger'

hiddenFrameStyle =
  top: '-20px'
  left: '-20px'
  bottom: 'auto'
  right: 'auto'
  width: '1px'
  height: '1px'
  display: 'block'
  position: 'fixed'
  zIndex: undefined
  overflow: 'hidden'

shownFrameStyle =
  top: '0px'
  left: '0px'
  right: '0px'
  bottom: '0px'
  width: '100%'
  height: '100%'
  display: 'block'
  position: 'fixed'
  zIndex: 10000
  overflow: 'auto'

rpcFrameInitStyle =
  tabIndex: -1
  height: "0"
  width: "1px"
  style:
    position: 'fixed'
    width: "1px"
    height: "1px"
    top: '-20px'
    left: '-20px'
    overflow: 'hidden'

# Builds the URL used by xdm
# Based upon the (app) configuration
getRemoteUrl = (config)->
  url = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{VERSION}"
  url += "&r=#{encodeURIComponent(document.referrer)}"
  url += "&js=#{config.jsUrl}"  if config.jsUrl
  url += "&uid=#{config.uid}"   if config.uid
  url += "&debug_remote=true"   if config.debugRemote
  url += "&access_token=#{config.accessToken}" if config.accessToken?
  url += "&user_hash=#{config.userHash}" if config.userHash != undefined
  url


class Channel
  constructor : (config, currentUser)->
    @currentUser = currentUser
    @timeout  = null
    @rpc     = null
    @config  = config
    @_ready = {}
    @promise = new Promise (resolve, reject)=>
      @_ready.resolve = resolve
      @_ready.reject = reject
    domready(@onDomReady)

  onDomReady : ()=>
    @timeout = setTimeout(@loadingFailed, 30000);
    @rpc = new xdm.Rpc
      remote    : getRemoteUrl(@config)
      container : document.body
      channel   : @config.appId
      props     : rpcFrameInitStyle
    ,
      remote    :
        message        : {},
        ready          : {},
        clearUserToken : {},
        refreshUser    : {}
      local:
        message         : @onMessage
        ready           : @ready
        loadError       : @error
        userUpdate      : @userUpdate
        settingsUpdate  : @settingsUpdate
        show            : @showIframe
        hide            : @hideIframe
        track           : @emitTrackEvent
        getClientConfig : @getClientConfig
    @rpc

  loadError       : (err)=>
    window.clearTimeout @timeout
    @_ready.reject err

  loadingFailed   : (err) =>
    @_ready.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')

  onMessage       : (e)->
    if e.error then @_ready.reject(e.error) else logger.log("RPC Message", arguments)

  ready           : (remoteConfig)   =>
    window.clearTimeout(@timeout)
    @remoteConfig = remoteConfig
    @_ready.resolve @

  getClientConfig : ()  => @config
  showIframe      : ()  => @applyFrameStyle(shownFrameStyle)
  hideIframe      : ()  => @applyFrameStyle(hiddenFrameStyle)
  emitTrackEvent  : (args...)  => EventBus.emit('hull.track',args...)
  settingsUpdate  : (remoteSettings)=> EventBus.emit('hull.settings.update', remoteSettings)
  userUpdate      : (me)=> @currentUser.update(me)
  applyFrameStyle : (styles)=>
    _.map styles, (v,k)=> @rpc.iframe.style[k] = v

    
module.exports = Channel
