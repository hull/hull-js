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

  (config, onMessage)->
    timeout = null
    deferred = promises.deferred()
    
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
      ,
        remote:  message: {}, ready: {} 
        local:   message: onMessage, ready: readyFn 
     
    deferred.promise
