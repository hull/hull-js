try
  hash = JSON.parse(atob(document.location.hash.replace('#', '')))
  if window.opener && window.opener.Hull && window.opener.__hull_login_status__ && hash?
    window.opener.__hull_login_status__(hash)
    window.close()

define ['underscore', '../utils/promises', '../utils/version'], (_, promises, version)->
  (apiFn, config, emitter, authServices=[]) ->
    authenticating = null
    _popupInterval = null

    loginComplete = (me)->
      dfd = promises.deferred()
      promise = dfd.promise
      promise.then ->
        emitter.emit('hull.auth.login', me)
        unless me?.stats?.sign_in_count?
          emitter.emit('hull.auth.create', me)
      , (err)->
        emitter.emit('hull.auth.fail', err)
      emitter.once 'hull.settings.update', ->
        # user has been set, settings have been update. Yay!
        dfd.resolve me
      # Setup a delay to launch rejection
      rejectable = _.bind(dfd.reject, dfd)
      _.delay rejectable, 30000, new Error('Timeout for login')
      promise

    loginFailed = (err)->
      emitter.emit('hull.auth.fail', err)
      throw err
      err

    signup = (user) ->
      apiFn('users', 'post', user).then loginComplete, loginFailed


    login = (loginOrProvider, optionsOrPassword, callback) ->
      throw new TypeError("'loginOrProvider' must be a String") unless _.isString(loginOrProvider)

      if _.isString(optionsOrPassword)
        promise = apiFn('users/login', 'post', { login: loginOrProvider, password: optionsOrPassword }).then ->
          apiFn.clearToken()
          apiFn('me')
      else
        promise = loginWithProvider(loginOrProvider, optionsOrPassword).then ->
          apiFn.clearToken()
          apiFn('me')

      evtPromise = promise.then loginComplete, loginFailed
      evtPromise.then(callback) if _.isFunction(callback)

      promise

    loginWithProvider = (providerName, opts)->
      return module.isAuthenticating() if module.isAuthenticating()

      providerName = providerName.toLowerCase()
      authenticating = promises.deferred()
      unless ~(_.indexOf(authServices, providerName ))
        authenticating.reject
          message: "No authentication service #{providerName} configured for the app"
          reason: 'no_such_service'
        return authenticating.promise

      authenticating.providerName = providerName

      authUrl = module.authUrl(config, providerName, opts)
      module.authHelper(authUrl)

      authenticating.promise


    logout = (callback)->
      promise = apiFn('logout')
      promise.done ->
        callback() if _.isFunction(callback)
      promise.then ()->
        emitter.emit('hull.auth.logout')

    onCompleteAuthentication = (hash)->
      _auth = authenticating
      return unless authenticating

      if hash.success
        authenticating.resolve({})
      else
        error = new Error('Login failed')
        for k, v of hash.error
          error[k] = v
        authenticating.reject(error)

      authenticating = null
      clearInterval(_popupInterval)
      _popupInterval = null
      _auth

    # Generates the complete URL to be reached to validate login
    generateAuthUrl = (config, provider, opts)->
      module.createCallback()

      auth_params = opts || {}
      auth_params.app_id        = config.appId
      # The following is here for backward compatibility. Must be removed at first sight next time
      auth_params.callback_url  = config.callback_url || config.callbackUrl || module.location.toString()
      auth_params.auth_referer  = module.location.toString()
      auth_params.version       = version
      querystring = _.map auth_params,(v,k) ->
        encodeURIComponent(k)+'='+encodeURIComponent(v)
      .join('&')
      "#{config.orgUrl}/auth/#{provider}?#{querystring}"

    module =
      isAuthenticating: -> authenticating?
      location: document.location
      authUrl: generateAuthUrl
      createCallback: ->
        window.__hull_login_status__ = (hash) ->
          window.__hull_login_status__ = null
          onCompleteAuthentication(hash)
      authHelper: (path)->
        w = window.open(path, "_auth", 'location=0,status=0,width=1030,height=600')

        # Support for cordova events
        if window.device?.cordova
          w?.addEventListener 'loadstart', (event)->
            hash = try JSON.parse(atob(event.url.split('#')[1]))
            if hash
              window.__hull_login_status__(hash)
              w.close()

        _popupInterval = w? && setInterval ->
          if w?.closed
            onCompleteAuthentication({ success: false, error: { reason: 'window_closed' } })
        , 200
      onCompleteAuth: onCompleteAuthentication

    authModule =
      signup: signup
      login: login
      logout: logout
      isAuthenticating: module.isAuthenticating

    authModule
