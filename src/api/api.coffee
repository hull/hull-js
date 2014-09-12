define ['underscore', '../utils/cookies', '../utils/version', '../api/params', '../api/auth', '../utils/promises', 'lib/api/xdm'], (_, cookie, version, apiParams, authModule, promises, xdm)->
  slice = Array.prototype.slice

  currentUserSignature = false

  init: (config={}, emitter)->
    dfd = promises.deferred()

    # Fail right now if we don't have the required setup
    unless config.orgUrl and config.appId
      dfd.reject(new ReferenceError 'no organizationURL provided. Can\'t proceed') unless config.orgUrl
      dfd.reject(new ReferenceError 'no applicationID provided. Can\'t proceed') unless config.appId
      return dfd.promise


    # Fix for http://www.hull.io/docs/users/backend on browsers where 3rd party cookies disabled
    try
      if window.jQuery && _.isFunction(window.jQuery.fn.ajaxSend)
          window.jQuery(document).ajaxSend (e, xhr, opts)->
            if currentUserSignature && !opts.crossDomain
              xhr.setRequestHeader('Hull-User-Sig', currentUserSignature)
    catch e
      #...
        
    
    


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
        currentUserSignature = val
        cookie.set(cookieName, val, path: "/")
      else
        currentUserSignature = false
        cookie.remove(cookieName, path: "/")

    rpc = null
    api.clearToken = ->
      rpc.clearUserToken() 

    # This will be executed exactly Once. The next call will be immediately resolved.
    onRemoteReady = (remoteObj)->
      rpc = remoteObj.rpc
      remoteConfig = remoteObj.config
      data = remoteConfig.data
      setCurrentUser(data.headers)

      authScope = data.headers['Hull-Auth-Scope'].split(":")[0] if data.headers?['Hull-Auth-Scope']

      auth: authModule(api, config, emitter, _.keys(remoteConfig.settings.auth || {}))
      remoteConfig: remoteConfig
      authScope: authScope or ''
      api: api
      init: ()-> dfd.promise

    xdm(config, emitter)
      .then(onRemoteReady)
      .then(dfd.resolve, dfd.reject)

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
              
        callback(res.response, res.headers)
        deferred.resolve(res.response)
      onError = (err={})->
        errback(err.message)
        deferred.reject(err.message)
      rpc.message params, onSuccess, onError
      deferred.promise

    dfd.promise
