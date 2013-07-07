if document.location.hash.indexOf("#hull-auth")==0 &&  window.opener && window.opener.Hull
  try
    authCbName = document.location.hash.replace('#hull-auth-', '')
    cb = window.opener[authCbName]
    cb(authCbName)
    return window.close()
  catch e
    console.warn("Error: " + e)

define ['underscore', 'lib/utils/promises', 'lib/utils/version'], (_, promises, version)->

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
      throw "No authentication service #{providerName} configured for the app" unless ~(authServices.indexOf(providerName + '_app'))

      authenticating = promises.deferred()
      authenticating.providerName = providerName
      authenticating.done callback if _.isFunction(callback)

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
      dfd.promise() #TODO It would be better to return the promise

    # Callback executed on successful authentication
    onCompleteAuthentication = ()->
      authenticating.resolve()
      authenticating = false

    # Generates the complete URL to be reached to validate login
    generateAuthUrl = (config, provider, opts)->
      auth_params = opts || {}
      auth_params.app_id        = config.appId
      auth_params.callback_url  = config.callback_url || module.location.toString()
      auth_params.auth_referer  = module.location.toString()
      auth_params.callback_name = module.createCallback()
      auth_params.version       = version

      "#{config.orgUrl}/auth/#{provider}?#{$.param(auth_params)}"

    module =
      isAuthenticating: -> authenticating #TODO It would be better to return Boolean (isXYZ method)
      location: document.location
      authUrl: generateAuthUrl
      createCallback: ->
        cbName = "__h__#{Math.random().toString(36).substr(2)}"
        cbFn = (name)->
          delete window[name]
          onCompleteAuthentication.apply undefined, arguments
        window[cbName] = _.bind(cbFn, undefined, cbName)
        cbName
      authHelper: (path)-> window.open(path, "_auth", 'location=0,status=0,width=990,height=600')
      onCompleteAuth: onCompleteAuthentication
    api =
      login: login
      logout: logout
    api
