requirejs.config
  require:
    paths:
      easyXDM: 'components/easyXDM/easyXDM'
define ['lib/version', 'lib/api/params', 'easyXDM', 'jquery'], (version, apiParams, easyXDM, promises)->
  slice = Array.prototype.slice

  # Builds the URL used by easyXDM
  # Based upon the (app) configuration
  buildRemoteUrl = (config)->
    remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
    remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
    remoteUrl += "&uid=#{config.uid}"   if config.uid
    remoteUrl += "&access_token=#{config.appSecret}" if config.appSecret
    remoteUrl += "&user_hash=#{config.userHash}" if config.userHash != undefined
    remoteUrl

  # Main method to request the API
  api = -> message.apply(api, apiParams.parse(slice.call(arguments)))

  # Method-specific function
  _.each ['get', 'post', 'put', 'delete'], (method)->
    api[method] = ()->
      args = apiParams.parse (slice.call(arguments))
      req         = args[0]
      req.method  = method
      message.apply(api, args)

  onRemoteMessage = (e)->
    if e.error
      # Get out of the easyXDM try/catch jail
      setTimeout(
        -> initialized.reject(e.error)
      , 0)
    else
      console.warn("RPC Message", arguments)

  (config)->
    dfd = promises.Deferred()
    #TODO Probably useless now
    timeout = setTimeout(
      ()->
        initialized.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')
      , 3000)

    setCurrentUser = (headers={})->
      return unless config.appId
      cookieName = "hull_#{config.appId}"
      currentUserId = $.cookie cookieName
      if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
        val = btoa(JSON.stringify(headers))
        $.cookie(cookieName, val, path: "/")
        if currentUserId != headers['Hull-User-Id']
          emitUserEvent()
      else
        $.removeCookie(cookieName, path: "/")
        emitUserEvent() if currentUserId

    onRemoteReady = (remoteConfig)->
      data = remoteConfig.data

      if data.headers && data.headers['Hull-User-Id']
        setCurrentUser data.headers
        dfd.resolve 
          remoteConfig: remoteConfig
          api: api


      window.clearTimeout(timeout)

    url = buildRemoteUrl(config)
    rpc = new easyXDM.Rpc({
      remote: url
    }, {
      remote: { message: {}, ready: {} }
      local:  { message: onRemoteMessage, ready: onRemoteReady }
    })

    ###
    # Sends the message described by @params to easyXDM
    # @param {Object} contains the provider, uri and parameters for the message
    # @param {Function} optional a success callback
    # @param {Function} optional an error callback
    # @return {Promise}
    ###
    message = (params, callback, errback)->
      console.error("Api not initialized yet") unless rpc
      promise = promises.Deferred()

      onSuccess = (res)->
        if res.provider == 'hull' && res.headers
          setCurrentUser(res.headers)
        callback(res.response)
        promise.resolve(res.response)
      onError = (err)->
        errback(err.message)
        promise.reject(err.message)
      rpc.message params, onSuccess, onError
      promise

    dfd
