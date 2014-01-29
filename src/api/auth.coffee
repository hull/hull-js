hash = try JSON.parse(atob(document.location.hash.replace('#', '')))
if window.opener && window.opener.Hull && hash?
  try
    window.opener.__hull_login_status__(hash)
    window.close()
  catch e
    console.warn('Error: ' + e)

define ['underscore', '../utils/promises', '../utils/version'], (_, promises, version)->
  (apiFn, config, authServices=[]) ->
    # Holds the state of the authentication process
    # @type {Promise|Boolean}
    authenticating = null
    _popupInterval = null

    login = (providerName, opts, callback)->
      return module.isAuthenticating() if module.isAuthenticating()

      throw 'The provider name must be a String' unless _.isString(providerName)
      providerName = providerName.toLowerCase()
      throw "No authentication service #{providerName} configured for the app" unless ~(_.indexOf(authServices, providerName + '_app'))

      authenticating = promises.deferred()
      authenticating.providerName = providerName

      authUrl = module.authUrl(config, providerName, opts)
      module.authHelper(authUrl)

      p = authenticating.promise
      p.then(callback) if _.isFunction(callback)
      p

    # Starts the logout process
    # @returns {Promise}
    # @TODO Misses a `dfd.fail`
    logout = (callback=->)->
      promise = apiFn('logout')
      promise.done ->
        callback() if _.isFunction(callback)
      promise

    onCompleteAuthentication = (hash)->
      _auth = authenticating
      return unless authenticating

      if hash.success
        authenticating.resolve({})
      else
        authenticating.reject(hash.error)

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
        w = window.open(path, "_auth", 'location=0,status=0,width=990,height=600')
        _popupInterval = w? && setInterval ->
          if w?.closed
            onCompleteAuthentication({ success: false, error: { reason: 'user_cancelled' } })
        , 200
      onCompleteAuth: onCompleteAuthentication

    authModule =
      login: login
      logout: logout
      isAuthenticating: module.isAuthenticating

    authModule
