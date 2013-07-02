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
      app.sandbox
      dfd = api('logout')
      dfd.done ->
        app.core.mediator.emit('hull.logout')
        api.model('me').clear()
        callback() if _.isFunction(callback)
      dfd.promise() #TODO It would be better to return the promise



    # Callback executed on successful authentication
    onCompleteAuthentication = ()->
      isAuthenticating = module.isAuthenticating()
      return unless isAuthenticating && isAuthenticating.state() == 'pending'
      providerName = isAuthenticating.providerName
      dfd = isAuthenticating
      try
        me = app.sandbox.data.api.model('me')
        me.fetch().then ->
          dfd.resolve()
          app.core.mediator.emit('hull.login', me)
        , dfd.reject
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
      auth_params.callback_name = module.createCallback()

      "#{config.orgUrl}/auth/#{provider}?#{$.param(auth_params)}"


    #
    # Module Definition
    #

    module =
      login: login,
      logout: logout,
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
      initialize: ->
        # Are we authenticating the user ?
        app.sandbox.authenticating = module.isAuthenticating

        app.sandbox.login = login
        app.sandbox.logout = logout

    module
