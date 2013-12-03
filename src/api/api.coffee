define ['underscore', '../utils/cookies', '../utils/version', '../api/params', '../api/auth', 'xdm', '../utils/promises', '../utils/cookies'], (_, cookie, version, apiParams, authModule, xdm, promises, cookies)->
  slice = Array.prototype.slice

  # Builds the URL used by xdm
  # Based upon the (app) configuration
  buildRemoteUrl = (config)->
    remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
    remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
    remoteUrl += "&uid=#{config.uid}"   if config.uid
    remoteUrl += "&access_token=#{config.appSecret}" if config.appSecret
    remoteUrl += "&user_hash=#{config.userHash}" if config.userHash != undefined
    remoteUrl

  dfd = promises.deferred()
  apiObject =
    init : (config)->
      message = null
      # Main method to request the API
      api = -> message.apply(undefined, apiParams.parse(slice.call(arguments)))
      # Method-specific function
      _.each ['get', 'post', 'put', 'delete'], (method)->
        api[method] = ()->
          args = apiParams.parse (slice.call(arguments))
          req         = args[0]
          req.method  = method
          message.apply(api, args)
      api.parseRoute = apiParams.parse

      onRemoteMessage = (e)->
        console.log('remoteMessage', e)
        if e.error
          # Get out of the xdm try/catch jail
          setTimeout(
            -> dfd.reject(e.error)
          , 0)
        else
          console.warn("RPC Message", arguments)

      #TODO Probably useless now
      timeout = setTimeout(
        ()->
          dfd.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')
        , 30000)

      setCurrentUser = (headers={})->
        return unless config.appId
        cookieName = "hull_#{config.appId}"
        currentUserId = cookie.get cookieName
        if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
          val = btoa(JSON.stringify(headers))
          cookie.set(cookieName, val, path: "/")
        else
          cookie.remove(cookieName, path: "/")

      # This will be executed exactly Once. The next call will be immediately resolved.
      onRemoteReady = (remoteConfig)->
        data = remoteConfig.data
        setCurrentUser(data.headers) if data.headers && data.headers['Hull-User-Id']
        window.clearTimeout(timeout)

        authScope = data.headers['Hull-Auth-Scope'].split(":")[0] if data.headers?['Hull-Auth-Scope']

        apiObject = 
          auth: authModule api, config, remoteConfig.services.types.auth
          remoteConfig: remoteConfig
          authScope: authScope or ''
          api: api
          init: ()-> dfd.promise

        dfd.resolve apiObject
        true

      url = buildRemoteUrl(config)
      rpc = new xdm.Rpc({
        remote: url,
        container: document.body

      }, {
        remote: { message: {}, ready: {} }
        local:  { message: onRemoteMessage, ready: onRemoteReady }
      })

      ###
      # Sends the message described by @params to xdm
      # @param {Object} contains the provider, uri and parameters for the message
      # @param {Function} optional a success callback
      # @param {Function} optional an error callback
      # @return {Promise}
      ###
      message = (params, callback, errback)->
        console.error("Api not initialized yet") unless rpc
        deferred = promises.deferred()

        onSuccess = (res)->
          setCurrentUser(res.headers) if res.provider == 'hull' && res.headers
          callback(res.response)
          deferred.resolve(res.response, res.headers)
        onError = (err)->
          errback(err.message)
          deferred.reject(err.message)
        rpc.message params, onSuccess, onError
        deferred.promise

      dfd.promise
    promise: dfd.promise

  # We return apiObject, for subsequent calls.
  apiObject
