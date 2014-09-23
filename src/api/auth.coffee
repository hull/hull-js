try
  hash = JSON.parse(atob(document.location.hash.replace('#', '')))
  if window.opener && window.opener.Hull && window.opener.__hull_login_status__ && hash?
    window.opener.__hull_login_status__(hash)
    window.close()

define ['underscore', '../utils/promises', '../utils/version'], (_, promises, version)->
  (apiFn, config, emitter, authServices=[]) ->
    authenticating = null
    _popupInterval = null

    loginComplete = (provider, me)->
      dfd = promises.deferred()
      promise = dfd.promise
      promise.then ->
        emitter.emit('hull.auth.login', me, provider)
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

    emailLoginComplete = _.bind(loginComplete, undefined, 'email')

    signup = (user) ->
      apiFn('users', 'post', user).then emailLoginComplete, loginFailed

    postForm = (path, method='post', params={}) ->
      form = document.createElement("form")
      form.setAttribute("method", method)
      form.setAttribute("action", path)

      for key of params
        if params.hasOwnProperty key
          hiddenField = document.createElement("input")
          hiddenField.setAttribute("type", "hidden")
          hiddenField.setAttribute("name", key)
          hiddenField.setAttribute("value", params[key])
          form.appendChild(hiddenField)
      document.body.appendChild(form)
      form.submit()

    login = (params, options={}, callback) ->
      refresh = ->
        apiFn.clearToken()
        apiFn('me')

      # Legacy Format.
      if _.isString(params)
        if _.isString(options)
          # Hull.login('email@host.com','password')
          options = {login:params, password:options}
        else
          # Hull.login('facebook','opts')
          options.provider = params
      else
        # We only use 1 hash for the new setup
        options = params


      # Set defaults for Redirect to current page if redirecting.
      options.redirect_url = options.redirect_url || window.location.href if options.strategy=='redirect'

      # New Format:
      if options.provider?
        # Social Login
        # Hull.login({provider:'facebook', strategy:'redirect|popup', redirect:'...'})
        promise = loginWithProvider(options).then(refresh)
        evtPromise = promise.then _.bind(loginComplete, undefined, params), loginFailed
      else
        # UserName+Password
        # Hull.login({login:'abcd@ef.com', password:'passwd', strategy:'redirect|popup', redirect:'...'})

        throw new Error('Seems like something is wrong in your Hull.login() call, We need a login and password fields to login. Read up here: http://www.hull.io/docs/references/hull_js/#user-signup-and-login') unless options.login? and options.password?

        # Early return since we're leaving the page.
        if options.strategy=='redirect'
          return postForm(config.orgUrl+'/api/v1/users/login', 'post', options)

        promise = apiFn('users/login', 'post', _.pick(options, 'login', 'password')).then(refresh)
        evtPromise = promise.then emailLoginComplete, loginFailed

      evtPromise.then(callback) if _.isFunction(callback)

      promise

    loginWithProvider = (options)->
      return module.isAuthenticating() if module.isAuthenticating()

      providerName = options.provider.toLowerCase()
      delete options.provider

      authenticating = promises.deferred()
      unless ~(_.indexOf(authServices, providerName ))
        authenticating.reject
          message: "No authentication service #{providerName} configured for the app"
          reason: 'no_such_service'
        return authenticating.promise

      authenticating.providerName = providerName


      if providerName == 'facebook' && !options.display?
        options.display = if options.strategy=='redirect' then 'page' else 'popup'

      authUrl = module.authUrl(config, providerName, options)

      if options.strategy == 'redirect'
        # Don't do an early return to not break promise chain
        window.location.href = authUrl
      else
        # Classic Popup Strategy
        module.authHelper(authUrl, providerName)

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
      auth_params.callback_url  = opts.redirect_url || config.callback_url || config.callbackUrl || module.location.toString()
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
      authHelper: (path, providerName)->

        if providerName == 'facebook'
          width = 650
          height = 430
        else
          width = 1030
          width = 430

        w = window.open(path, "_auth", "location=0,status=0,width=#{width},height=#{height}")

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
