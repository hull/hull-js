xdm      = require '../utils/xdm'
domready = require '../utils/domready'
_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
logger   = require '../utils/logger'
Promise  = require '../utils/promises'

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

class Channel

  constructor : (currentUser, currentConfig)->
    @allowRetry = true
    @retryCount = 0
    @currentConfig = currentConfig
    @currentUser = currentUser
    @timeout  = null
    @rpc     = null
    @_ready = {}
    @promise = new Promise (resolve, reject)=>
      @_ready.resolve = resolve
      @_ready.reject = reject
    domready(@startRpc)

  startRpc: =>
    @retryCount += 1
    @timeout = setTimeout(@loadingFailed, @retryCount * 10000)
    @rpc = new xdm.Rpc
      remote    : @currentConfig.getRemoteUrl()
      container : document.body
      channel   : [@currentConfig.get('appId'), @retryCount].join("-")
      props     : rpcFrameInitStyle
    ,
      remote    :
        message        : {},
        ready          : {},
        refreshUser    : {}
      local:
        message         : @onMessage
        ready           : @ready
        loadError       : @loadError
        userUpdate      : @userUpdate
        configUpdate    : @configUpdate
        show            : @showIframe
        hide            : @hideIframe
        track           : @emitTrackEvent
        getClientConfig : @getClientConfig
    @rpc

  loadError: (err)=>
    window.clearTimeout(@timeout)
    @allowRetry = false
    @_ready.reject new Error(err)

  loadingFailed: (err) =>
    @rpc && @rpc.destroy()
    if @allowRetry && @retryCount < 4
      @startRpc()
    else
      @_ready.reject(new Error('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.'))

  onMessage       : (e)->
    if e.error then @_ready.reject(e.error) else logger.log("RPC Message", arguments)

  ready : (remoteConfig)   =>
    try
      window.clearTimeout(@timeout)
      @currentConfig.initRemote(remoteConfig)
      @_ready.resolve @
    catch err
      @_ready.reject(err)

  getClientConfig : ()  => @currentConfig.get()
  showIframe      : ()  => @applyFrameStyle(shownFrameStyle)
  hideIframe      : ()  => @applyFrameStyle(hiddenFrameStyle)
  emitTrackEvent  : (args...)  => EventBus.emit('hull.track',args...)
  configUpdate    : (config)=> @currentConfig.setRemote(config)
  userUpdate      : (me)=>     @currentUser.set(me)
  applyFrameStyle : (styles)=>
    _.map styles, (v,k)=> @rpc.iframe.style[k] = v


module.exports = Channel
