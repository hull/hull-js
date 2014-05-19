define ['domready', 'lib/utils/promises', 'xdm', 'lib/utils/version', 'underscore'], (domready, promises, xdm, version, _)->

  # Builds the URL used by xdm
  # Based upon the (app) configuration
  buildRemoteUrl = (config)->
    remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
    remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
    remoteUrl += "&uid=#{config.uid}"   if config.uid
    remoteUrl += "&debug_remote=true"   if config.debugRemote
    accessToken = config.accessToken || config.appSecret
    remoteUrl += "&access_token=#{accessToken}" if accessToken?
    remoteUrl += "&user_hash=#{config.userHash}" if config.userHash != undefined
    remoteUrl += "&r=#{encodeURIComponent(document.referrer)}"
    remoteUrl

  (config, emitter)->
    timeout = null
    rpc = null
    deferred = promises.deferred()

    onMessage = (e)->
      console.log('remoteMessage', e)
      if e.error
        deferred.reject e.error
      else
        console.warn("RPC Message", arguments)

    settingsUpdate = (currentSettings)->
      emitter.emit('hull.settings.update', currentSettings)

    userUpdate = (currentUser)->
      emitter.emit('hull.auth.update', currentUser)

    readyFn = (remoteConfig)->
      window.clearTimeout(timeout)
      deferred.resolve { rpc: rpc, config: remoteConfig }

    getClientConfig = -> config


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


    showIframe = -> applyFrameStyle(shownFrameStyle)
    hideIframe = -> applyFrameStyle(hiddenFrameStyle)

    applyFrameStyle = (styles)->
      _.map styles, (v,k)-> rpc.iframe.style[k] = v

    domready ->
      timeout = setTimeout(
        ()->
          deferred.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')
        , 30000)

      rpc = new xdm.Rpc
        remote: buildRemoteUrl config
        container: document.body
        props:
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
      ,
        remote:  message: {}, ready: {}
        local:
          message: onMessage, 
          ready: readyFn, 
          userUpdate: userUpdate, 
          settingsUpdate: settingsUpdate
          getClientConfig: getClientConfig
          show: showIframe
          hide: hideIframe

    deferred.promise
