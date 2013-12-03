if /hull-auth-status-/.test(document.location.hash) &&  window.opener && window.opener.Hull
  try
    authCbName = document.location.hash.replace('#hull-auth-status-', '')
    cb = window.opener.__hull_login_status__
    cb(authCbName)
    return window.close()
  catch e
    console.warn("Error: " + e)

define ['underscore', '../utils/promises', '../utils/version'], (_, promises, version)->

  (apiFn, config, authServices=[]) ->
    # Holds the state of the authentication process
    # @type {Promise|Boolean}
    authenticating = false


    # Starts the login process
    # @throws Error with invalid providerName
    # @returns {Promise|false}
    login = (providerName, opts, callback=->)->
      return module.isAuthenticating() if module.isAuthenticating()

      throw 'The provider name must be a String' unless _.isString(providerName)
      providerName = providerName.toLowerCase()
      throw "No authentication service #{providerName} configured for the app" unless ~(_.indexOf(authServices, providerName + '_app'))

      authenticating = promises.deferred()
      authenticating.providerName = providerName
      authenticating.promise.done callback if _.isFunction(callback)

      authUrl = module.authUrl(config, providerName, opts)
      module.authHelper(authUrl)

      authenticating #TODO It would be better to return the promise

    # Starts the logout process
    # @returns {Promise}
    # @TODO Misses a `dfd.fail`
    logout = (callback=->)->
      dfd = apiFn('logout')
      dfd.done ->
        callback() if _.isFunction(callback)
      dfd.promise

    # Callback executed on successful authentication
    onCompleteAuthentication = (isSuccess)->
      if isSuccess
        authenticating.resolve()
      else
        authenticating.reject('Login canceled')
      authenticating = false

    # Generates the complete URL to be reached to validate login
    generateAuthUrl = (config, provider, opts)->
      auth_params = opts || {}
      auth_params.app_id        = config.appId
      # The following is here for backward compatibility. Must be removed at first sight next time
      auth_params.callback_url  = config.callback_url || config.callbackUrl || module.location.toString()
      auth_params.auth_referer  = module.location.toString()
      auth_params.callback_name = module.createCallback()
      auth_params.version       = version
      querystring = _.map auth_params,(v,k) ->
        encodeURIComponent(k)+'='+encodeURIComponent(v)
      .join('&')
      "#{config.orgUrl}/auth/#{provider}?#{querystring}"

    module =
      isAuthenticating: -> authenticating #TODO It would be better to return Boolean (isXYZ method)
      location: document.location
      authUrl: generateAuthUrl
      createCallback: ->
        successToken = "__h__#{Math.random().toString(36).substr(2)}"
        cbFn = (name)->
          window.__hull_login_status__ = undefined
          result = (name == successToken)
          onCompleteAuthentication.call undefined, result
        window.__hull_login_status__ = _.bind(cbFn, undefined)
        successToken
      authHelper: (path)-> window.open(path, "_auth", 'location=0,status=0,width=990,height=600')
      onCompleteAuth: onCompleteAuthentication

    authModule =
      login: login
      logout: logout

    authModule
