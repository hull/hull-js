define ['lib/utils/flash', 'underscore', '../utils/cookies', '../utils/version', '../api/params', '../api/auth', '../utils/promises', 'lib/api/xdm'], (flash, _, cookie, version, apiParams, authModule, promises, xdm)->
  slice = Array.prototype.slice

  init : (config={}, emitter)->
    dfd = promises.deferred()

    # Fail right now if we don't have the required setup
    unless config.orgUrl and config.appId
      unless config.orgUrl
        msg = "No 'orgUrl' parameter passed to Hull.init. Can't proceed."
      unless config.appId
        msg = "No 'appId' parameter passed to Hull.init. Can't proceed."
      flash msg
      dfd.reject(new ReferenceError msg)
      return dfd.promise

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

    # No need to be exposed, IMO
    api.parseRoute = apiParams.parse

    setCurrentUser = (headers={})->
      return unless config.appId
      cookieName = "hull_#{config.appId}"
      if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
        val = btoa(JSON.stringify(headers))
        cookie.set(cookieName, val, path: "/")
      else
        cookie.remove(cookieName, path: "/")

    # This will be executed exactly Once. The next call will be immediately resolved.
    onRemoteReady = (remoteConfig)->
      data = remoteConfig.data
      setCurrentUser(data.headers)

      authScope = data.headers['Hull-Auth-Scope'].split(":")[0] if data.headers?['Hull-Auth-Scope']

      apiConnection =
        auth: authModule(api, config, remoteConfig.services.types.auth)
        remoteConfig: remoteConfig
        authScope: authScope or ''
        api: api
        init: ()-> dfd.promise

      dfd.resolve apiConnection
      true

    rpc = null
    xdm(config, emitter).then (readyObj)->
      rpc = readyObj.rpc
      onRemoteReady readyObj.config
    , (err)->
      dfd.reject err

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

      onSuccess = (res={})->
        setCurrentUser(res.headers) if res.provider == 'hull'
        headers = res?.headers
        if headers? and res.provider == 'hull'
          hullTrack = headers['Hull-Track']
          if hullTrack
            try
              [eventName, trackParams] = JSON.parse(atob(hullTrack))
              emitter.emit(eventName, trackParams)
            catch error
              false
        callback(res.response)
        deferred.resolve(res.response, res.headers)
      onError = (err={})->
        errback(err.message)
        deferred.reject(err.message)
      rpc.message params, onSuccess, onError
      deferred.promise

    dfd.promise
