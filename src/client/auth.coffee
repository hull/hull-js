Promise  = require 'bluebird'
assign   = require '../polyfills/assign'
_        = require '../utils/lodash'
logger   = require '../utils/logger'
EventBus = require '../utils/eventbus'
isMobile = require '../utils/is-mobile'

getNoUserPromise = ()->
  Promise.reject({
    reason: 'no_current_user',
    message: 'User must be logged in to perform this action'
  })

getUser = ()->
  user = Hull.currentUser()
  return (!!user && user.id?)

parseParams = (argsArray)->

  opts = {}

  while (next = argsArray.shift())
    if _.isString next
      if !login
        login = next
      else
        password = next
    else if _.isFunction next
      if !callback
        callback = next
      else
        errback = next
    else if _.isObject(next) and !_.isEmpty(next)
      if !login and !password
        opts = next
      else
        opts.params = assign(next, opts.params||{})

  if login
    opts  = if password then assign(opts, {login, password}) else assign(opts, {provider:login})

  opts.params = opts.params || {}
  callback = callback || ->
  errback  = errback  || ->

  opts.params.display ||= 'touch' if isMobile()

  # Setup defaults for Popup login for Facebook on Desktop

  # # Redirect login by default. if on Mobile.
  # # Setup 'display' to be 'touch' for Facebook Login if on Mobile
  if opts.provider == 'facebook'
    opts.params.display ||= if opts.strategy == 'redirect' then 'page' else 'popup'

  # TODO : OK to ignore `params` in this email login scenario ?
  delete opts.params if opts.password?

  {
    options: opts
    callback : callback
    errback : errback
  }

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

class Auth
  constructor: (api, currentUser, currentConfig)->
    @api             = api
    @currentUser     = currentUser
    @currentConfig   = currentConfig
    @_popupInterval  = null
    @_authenticating = null
    @authServices    = _.keys(@currentConfig.get('services.auth'))

  isAuthenticating : -> @_authenticating?

  # Generates the complete URL to be reached to validate login
  generateAuthUrl : (opts={})->
    @createAuthCallback()
    params              = opts.params || {}
    params.app_id       = @currentConfig.get('appId')
    # The following is here for backward compatibility. Must be removed at first sight next time
    params.callback_url = opts.redirect_url || params.callback_url || @currentConfig.get('callback_url') || @currentConfig.get('callbackUrl') || document.location.toString()
    params.auth_referer = document.location.toString()
    params.version      = @currentConfig.get('version')
    params._bid         = @currentConfig.identifyBrowser().id
    params._sid         = @currentConfig.identifySession().id
    querystring         = _.map params,(v,k) ->
      encodeURIComponent(k)+'='+encodeURIComponent(v)
    .join('&')
    "#{@currentConfig.get('orgUrl')}/auth/#{opts.provider}?#{querystring}"

  createAuthCallback: =>
    window.__hull_login_status__ = (hash) =>
      window.__hull_login_status__ = null
      @onAuthComplete(hash)

  popupAuthWindow: (path, opts={})->

    # Handle smaller Facebook popup windows
    [width, height] = if opts.provider == 'facebook' and opts.params.display == 'popup' then [500, 400] else [1030, 550]

    openerString = "location=0,status=0,width=#{width},height=#{height}"

    w = window.open(path, "_auth",openerString)

    # Support for cordova events
    if window.device?.cordova
      w?.addEventListener 'loadstart', (event)->
        hash = try JSON.parse(Base64.decode(event.url.split('#')[1]))
        if hash
          window.__hull_login_status__(hash)
          w.close()

    # 30 seconds after creating popup, reject promise if still active.

    setTimeout ()=>
      @onAuthComplete({ success: false, error: { reason: 'timeout', message: 'Timeout for login (after 30 seconds), User never finished the auth' } })
    , 90000

    # Reject Promise if window has been closed
    @_popupInterval = w? && setInterval =>
      @onAuthComplete({ success: false, error: { reason: 'window_closed', message: 'User closed the window before finishing. He might have canceled' } }) if w?.closed
    , 200

  onAuthComplete : (hash)=>
    return unless @_authenticating
    if hash.success
      @_authenticating.resolve({})
    else
      error = new Error("Login failed : #{hash?.error?.reason}")
      error[k] = v for k, v of hash.error
      @_authenticating.reject(error)

    @_authenticating = null
    clearInterval(@_popupInterval)
    @_popupInterval = null

    undefined

  loginWithProvider : (opts)=>
    isAuthenticating = @isAuthenticating()
    return isAuthenticating if isAuthenticating

    @_authenticating = {}
    promise = new Promise (resolve, reject)=>
      @_authenticating.resolve = resolve
      @_authenticating.reject = reject

    unless ~(_.indexOf(@authServices, opts.provider))
      @_authenticating.reject
        message: "No authentication service #{opts.provider} configured for the app"
        reason: 'no_such_service'
      return promise

    @_authenticating.provider = opts.provider.toLowerCase()

    authUrl = @generateAuthUrl(opts)

    if opts.strategy == 'redirect'
      # Don't do an early return to not break promise chain
      window.location.href = authUrl
    else
      # Classic Popup Strategy
      @popupAuthWindow(authUrl, opts)

    promise

  login : () =>
    if @isAuthenticating()
      # Return promise even if login is in progress.
      msg = "Login in progress. Use `Hull.on('hull.user.login', callback)` to call `callback` when done."
      logger.info msg
      return Promise.reject {error: {reason:'in_progress', message: 'Login already in progress'}}

    # Handle Legacy Format,
    # Ensure New Format: Hash signature
    # Preprocess Options
    # Opts format is now : {login:"", password:"", params:{}} or {provider:"", params:{}}
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))

    if !(options?.provider? || options.login? || options.access_token?)
      # UserName+Password
      # Hull.login({login:'abcd@ef.com', password:'passwd', strategy:'redirect|popup', redirect:'...'})
      unless options.login? and options.password?
        msg = 'Seems like something is wrong in your Hull.login() call, We need a login and password fields to login. Read up here: http://www.hull.io/docs/references/hull_js/#user-signup-and-login'
        logger.warn msg
        return Promise.reject({error:{ reason:'missing_parameters', message:'Empty login or password' }})



    if options.provider?
      # Social Login
      if options.access_token?
        # Hull.login({provider:'facebook', access_token:'xxxx'})
        provider = assign({}, options)
        delete provider.provider
        op = {}
        op[options.provider] = provider
        promise = @api.message('users', 'post', op)
      else
        # Hull.login({provider:'facebook', strategy:'redirect|popup', redirect:'...'})
        promise = @loginWithProvider(options)

    else

      # Email Login
      # Hull.login({login:'user@host.com', password:'xxxx'})
      # Hull.login({access_token:'xxxxx'})

      promise = @api.message('users/login', 'post', _.pick(options, 'login', 'password', 'access_token'))

      if options.strategy == 'redirect' ||  !@currentConfig.getRemote('cookiesEnabled')
        postUrl = @currentConfig.get('orgUrl')+'/api/v1/users/login'
        options.redirect_url ||= window.location.href
        promise = promise.then -> postForm(postUrl, 'post', options)

    @completeLoginPromiseChain(promise, callback, errback)

  logout: (options={}, callback, errback) =>
    promise = @api.message('logout')
    if options.strategy == 'redirect' || !@currentConfig.getRemote('cookiesEnabled')
      redirect_url = options.redirect_url || document.location.href
      # Add this param to make sure safari actually redirects to the logoutUrl
      b = new Date().getTime()
      logoutUrl = @currentConfig.get('orgUrl') + '/api/v1/logout?b=' + b + '&redirect_url=' + encodeURIComponent(redirect_url)
      promise.then -> document.location = logoutUrl

    @completeLoginPromiseChain(promise,callback,errback)


  resetPassword : (email=@currentUser.get('email'), callback, errback) =>
    promise = @api.message('/users/request_password_reset', 'post', {email})
    @completeLoginPromiseChain(promise,callback,errback)

  confirmEmail : (email=@currentUser.get('email'), callback, errback) =>
    promise = @api.message('/users/request_confirmation_email', 'post', {email})
    @completeLoginPromiseChain(promise,callback,errback)

  signup : (attrs, callback, errback) =>
    promise = @api.message('users', 'POST', attrs)
    if !@currentConfig.getRemote('cookiesEnabled')
      postUrl = @currentConfig.get('orgUrl')+'/api/v1/users/login'
      promise = promise.then (user)->
        params = {
          redirect_url: window.location.href,
          access_token: user.access_token
        }
        postForm(postUrl, 'post', params)
    @completeLoginPromiseChain(promise, callback, errback)

  ###*
   * link an Identity to a Hull User
   * @param  {options} An options Hash
   * @param  {callback} Success callback
   * @param  {errback} error callback
   * @return {Promise} A promise
  ###
  linkIdentity   : ()=>
    return getNoUserPromise() unless getUser()
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))
    options.params.mode = 'connect'
    @login(options, callback, errback)

  ###*
   * unlink an Identity from a Hull User
   * @param  {options} An options Hash
   * @param  {callback} Success callback
   * @param  {errback} error callback
   * @return {Promise} A promise
   *
  ###
  unlinkIdentity : ()=>
    return getNoUserPromise() unless getUser()
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))
    promise = @api.message("me/identities/#{options.provider}", 'delete')
    @completeLoginPromiseChain(promise,callback,errback)

  completeLoginPromiseChain: (promise, callback,errback)=>
    if promise && promise.then
      callback = callback || ->
      errback  = errback  || ->

      p = promise.then @api.refreshUser, @emitLoginFailure
      p.then callback, errback
      p

  emitLoginFailure : (err)->
    EventBus.emit("hull.user.fail", err)
    err
    throw err

module.exports = Auth
