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
      providerName = providerName.toLowerCase()

      authenticating = module.sandbox.data.deferred()
      authenticating.providerName = providerName
      authenticating.done callback if _.isFunction(callback)

      authUrl = module.authUrl(app.config, providerName, opts)
      module.authHelper(authUrl)

      authenticating



    # Starts the logout process
    # @returns {Promise}
    # @TODO Misses a `dfd.fail`
    logout = (callback=->)->
      module.core.setCurrentUser(false)
      api = module.sandbox.data.api;
      dfd = api('logout')
      dfd.done ->
        api.model('me').clear()
        api.model('me').trigger('change')
        api.model.clearAll()
        callback() if _.isFunction(callback)
      dfd



    # Generates the callback executed on successful authentication
    authCompleteCallback = ()->
      isAuthenticating = module.isAuthenticating()
      return unless isAuthenticating && isAuthenticating.state() == 'pending'
      providerName = isAuthenticating.providerName
      dfd = isAuthenticating
      try
        me = module.sandbox.data.api.model('me')
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


    #
    # Module Definition
    #

    module =
      sandbox: app.sandbox
      core: app.core
      isAuthenticating: -> authenticating
      location: document.location
      authUrl: generateAuthUrl
      authHelper: (path)-> window.open(path, "_auth", 'location=0,status=0,width=990,height=600')

      initialize: ->
        # Tell the world that the login process has ended
        module.core.mediator.on "hull.authComplete", authCompleteCallback

        # Are we authenticating the user ?
        module.sandbox.authenticating = module.isAuthenticating

        module.sandbox.login = login
        module.sandbox.logout = logout


    module
