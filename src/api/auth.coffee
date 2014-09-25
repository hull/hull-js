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

    isMobile = ->
      # http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser
      n = navigator.userAgent||navigator.vendor||window.opera
      !! /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(n)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(n.substr(0,4));

    login = (opts, params={}, callback) ->
      refresh = ->
        apiFn.clearToken()
        apiFn('me')

      # Legacy Format.
      if _.isString(opts)
        if _.isString(params)
          # Hull.login('email@host.com','password')
          opts = { login:opts, password:params }
        else
          # Hull.login('facebook',{params})
          opts = { provider: opts }

      # Don't overwrite opts.params if it exists.
      opts.params ||= params unless _.isObject(opts.params)

      # Opts format is now : {login:"", password:"", params:{}} or {provider:"", params:{}}

      # Redirect login by default. if on Mobile.
      # Setup 'display' to be 'touch' for Facebook Login if on Mobile
      if isMobile()
        # We're on mobile, setup defaults for Touch/Redirect login
        opts.strategy ||= 'redirect'
        opts.params.display ||= 'touch'
      else
        # Setup defaults for Popup login for Facebook on Desktop
        if opts.provider == 'facebook'
          opts.params.display ||= if opts.strategy=='redirect' then 'page' else 'popup'

      # Redirect to current page by default for Redirect login
      # TODO: Facebook calls it redirect_uri => Shouldnt we do the same?
      opts.redirect_url ||= window.location.href if opts.strategy == 'redirect'


      # New Format: Hash signature

      if opts.provider?
        # Social Login
        # Hull.login({provider:'facebook', strategy:'redirect|popup', redirect:'...'})
        promise = loginWithProvider(opts).then(refresh)
        evtPromise = promise.then _.bind(loginComplete, undefined, opts), loginFailed
      else
        # UserName+Password
        # Hull.login({login:'abcd@ef.com', password:'passwd', strategy:'redirect|popup', redirect:'...'})
        throw new Error('Seems like something is wrong in your Hull.login() call, We need a login and password fields to login. Read up here: http://www.hull.io/docs/references/hull_js/#user-signup-and-login') unless opts.login? and opts.password?

        # TODO : OK to ignore `params` in this email login scenario ?
        delete opts.params

        # Early return since we're leaving the page.
        return postForm(config.orgUrl+'/api/v1/users/login', 'post', opts) if opts.strategy=='redirect'

        promise = apiFn('users/login', 'post', _.pick(opts, 'login', 'password')).then(refresh)
        evtPromise = promise.then emailLoginComplete, loginFailed

      evtPromise.then(callback) if _.isFunction(callback)

      promise

    loginWithProvider = (opts)->
      return module.isAuthenticating() if module.isAuthenticating()

      authenticating = promises.deferred()
      unless ~(_.indexOf(authServices, opts.provider))
        authenticating.reject
          message: "No authentication service #{opts.provider} configured for the app"
          reason: 'no_such_service'
        return authenticating.promise

      authenticating.provider = opts.provider

      authUrl = module.authUrl(config, opts)

      if opts.strategy == 'redirect'
        # Don't do an early return to not break promise chain
        window.location.href = authUrl
      else
        # Classic Popup Strategy
        module.authHelper(authUrl, opts)

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
    generateAuthUrl = (config, opts={})->
      module.createCallback()

      params = opts.params || {}
      params.app_id        = config.appId
      # The following is here for backward compatibility. Must be removed at first sight next time
      params.callback_url  = opts.redirect_url || params.callback_url || config.callback_url || config.callbackUrl || module.location.toString()
      params.auth_referer  = module.location.toString()
      params.version       = version
      debugger
      querystring = _.map params,(v,k) ->
        encodeURIComponent(k)+'='+encodeURIComponent(v)
      .join('&')
      "#{config.orgUrl}/auth/#{opts.provider}?#{querystring}"

    module =
      isAuthenticating: -> authenticating?
      location: document.location
      authUrl: generateAuthUrl
      createCallback: ->
        window.__hull_login_status__ = (hash) ->
          window.__hull_login_status__ = null
          onCompleteAuthentication(hash)
      authHelper: (path, opts={})->

        openerString = "location=0,status=0"

        # Handle smaller Facebook popup windows
        if opts.provider == 'facebook' and opts.params.display == 'popup'
          width = 500
          height = 400
        else
          width = 1030
          height = 550

        openerString = "#{openerString},width=#{width},height=#{height}"

        w = window.open(path, "_auth",openerString)

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
