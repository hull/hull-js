define ->
  # Holds the state of the authentication process
  # @type {Promise|Boolean}
  authenticating = false

  (app) ->
    # Starts the login process
    # @throws Error with invalid providerName
    # @returns {Promise|false}
    login = (providerName, opts, callback=->)->
      return module.isAuthenticating() if module.isAuthenticating()

      throw 'The provider name must be a String' unless _.isString(providerName)
      authServices = app.sandbox.config.services.types.auth || []
      providerName = providerName.toLowerCase()
      throw "No authentication service #{providerName} configured for the app" unless ~(authServices.indexOf(providerName + '_app'))

      authenticating = app.sandbox.data.deferred()
      authenticating.providerName = providerName
      authenticating.done callback if _.isFunction(callback)

      authUrl = module.authUrl(app.config, providerName, opts)
      module.authHelper(authUrl)

      authenticating #TODO It would be better to return the promise

    # Starts the logout process
    # @returns {Promise}
    # @TODO Misses a `dfd.fail`
    logout = (callback=->)->
      api = app.sandbox.data.api;
      dfd = api('logout')
      dfd.done ->
        app.core.setCurrentUser(false)
        api.model('me').clear()
        api.model('me').trigger('change')
        callback() if _.isFunction(callback)
      dfd #TODO It would be better to return the promise

    # Callback executed on successful authentication
    onCompleteAuthentication = ()->
      isAuthenticating = module.isAuthenticating()
      return unless isAuthenticating && isAuthenticating.state() == 'pending'
      providerName = isAuthenticating.providerName
      dfd = isAuthenticating
      try
        me = app.sandbox.data.api.model('me')
        dfd.done -> me.trigger('change')
        me.fetch(silent: true).then(dfd.resolve, dfd.reject)
      catch err
        console.error "Error on auth promise resolution", err
      finally
        authenticating = false

    # Generates the complete URL to be reached to validate login
    generateAuthUrl = (config, provider, opts)->
      auth_params = opts || {}
      auth_params.app_id        = config.appId
      auth_params.callback_url  = config.callback_url || module.location.toString()
      auth_params.auth_referer  = module.location.toString()

      "#{config.orgUrl}/auth/#{provider}?#{$.param(auth_params)}"

    module =
      login: login,
      logout: logout,
      isAuthenticating: -> authenticating #TODO It would be better to return Boolean (isXYZ method)
      location: document.location
      authUrl: generateAuthUrl
      authHelper: (path)-> window.open(path, "_auth", 'location=0,status=0,width=990,height=600')
      onCompleteAuth: onCompleteAuthentication
      initialize: ->
        # Tell the world that the login process has ended
        app.core.mediator.on "hull.auth.complete", onCompleteAuthentication

        # Are we authenticating the user ?
        app.sandbox.authenticating = module.isAuthenticating

        app.sandbox.login = login
        app.sandbox.logout = logout

    module
