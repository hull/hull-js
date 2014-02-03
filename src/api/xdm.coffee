define ['domready', 'lib/utils/promises', 'xdm', 'lib/utils/version'], (domready, promises, xdm, version)->

  # Builds the URL used by xdm
  # Based upon the (app) configuration
  buildRemoteUrl = (config)->
    remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
    remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
    remoteUrl += "&uid=#{config.uid}"   if config.uid
    remoteUrl += "&access_token=#{config.appSecret}" if config.appSecret
    remoteUrl += "&user_hash=#{config.userHash}" if config.userHash != undefined
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
      emitter.emit('hull.auth.login', currentUser) if currentUser
      emitter.emit('hull.auth.logout') unless currentUser

    readyFn = (remoteConfig)->
      window.clearTimeout(timeout)
      deferred.resolve { rpc: rpc, config: remoteConfig }

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
            width: "0"
            top: '-20px'
            left: '-20px'
      ,
        remote:  message: {}, ready: {}
        local:   message: onMessage, ready: readyFn, userUpdate: userUpdate, settingsUpdate: settingsUpdate

    deferred.promise
