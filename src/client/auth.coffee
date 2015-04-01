assign   = require 'object-assign'
_        = require '../utils/lodash'
promises = require '../utils/promises'
EventBus = require '../utils/eventbus'
isMobile = require '../utils/is-mobile'
Base64   = require '../utils/base64'

try
  h = document.location.hash.replace('#', '')
  if !!h
    hash = JSON.parse(Base64.decode(h))
    if window?.opener?.Hull? and window?.opener?.__hull_login_status__ and  !!hash
      window.opener.__hull_login_status__(hash)
      window.close()

getNoUserPromise = ()->
  noUserDfd = promises.deferred()
  noUserDfd.promise.fail(->)
  noUserDfd.reject(
    reason: 'no_current_user',
    message: 'User must be logged in to perform this action'
  )
  noUserDfd.promise

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

  if !(opts?.provider? || opts.login?)
    # UserName+Password
    # Hull.login({login:'abcd@ef.com', password:'passwd', strategy:'redirect|popup', redirect:'...'})
    throw new Error('Seems like something is wrong in your Hull.login() call, We need a login and password fields to login. Read up here: http://www.hull.io/docs/references/hull_js/#user-signup-and-login') unless opts.login? and opts.password?

  if isMobile()
    # We're on mobile, setup defaults for Touch/Redirect login
    opts.strategy       ||= 'redirect'
    opts.params.display ||= 'touch'

  # Setup defaults for Popup login for Facebook on Desktop

  # # Redirect login by default. if on Mobile.
  # # Setup 'display' to be 'touch' for Facebook Login if on Mobile
  if opts.provider == 'facebook'
    opts.params.display ||= if opts.strategy == 'redirect' then 'page' else 'popup'

  # Redirect to current page by default for Redirect login
  # TODO: Facebook calls it redirect_uri => Shouldnt we do the same?
  if opts.strategy == 'redirect'
    redirect = window.location.href
    opts.redirect_url ||= redirect

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
  constructor: (api)->
    @api             = api
    @config          = api.config
    @_popupInterval  = null
    @_authenticating = null
    @authServices    = _.keys(api.services.auth)

  isAuthenticating : -> @_authenticating?

  # Generates the complete URL to be reached to validate login
  generateAuthUrl : (opts={})->
    @createAuthCallback()
    params              = opts.params || {}
    params.app_id       = @config.appId
    # The following is here for backward compatibility. Must be removed at first sight next time
    params.callback_url = opts.redirect_url || params.callback_url || @config.callback_url || @config.callbackUrl || document.location.toString()
    params.auth_referer = document.location.toString()
    params.version      = @config.version
    querystring         = _.map params,(v,k) ->
      encodeURIComponent(k)+'='+encodeURIComponent(v)
    .join('&')
    "#{@config.orgUrl}/auth/#{opts.provider}?#{querystring}"

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
    _.delay ()=>
      @onAuthComplete
    , 30000, { success: false, error: { reason: 'timeout', message: 'Timeout for login (after 30 seconds), User never finished the auth' } }

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

    @_authenticating = promises.deferred()

    unless ~(_.indexOf(@authServices, opts.provider))
      @_authenticating.reject
        message: "No authentication service #{opts.provider} configured for the app"
        reason: 'no_such_service'
      return @_authenticating.promise

    @_authenticating.provider = opts.provider.toLowerCase()

    authUrl = @generateAuthUrl(opts)

    if opts.strategy == 'redirect'
      # Don't do an early return to not break promise chain
      window.location.href = authUrl
    else
      # Classic Popup Strategy
      @popupAuthWindow(authUrl, opts)

    @_authenticating.promise

  login : () =>

    if @isAuthenticating()
      # Return promise even if login is in progress.
      msg = "Login in progress. Use `Hull.on('hull.user.login', callback)` to call `callback` when done."
      console.info msg
      dfd = promises.deferred()
      dfd.reject {error: {reason:'in_progress', message: msg}}
      return dfd.promise;

    # Handle Legacy Format,
    # Ensure New Format: Hash signature
    # Preprocess Options
    # Opts format is now : {login:"", password:"", params:{}} or {provider:"", params:{}}
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))

    if options.provider?
      # Social Login
      # Hull.login({provider:'facebook', strategy:'redirect|popup', redirect:'...'})
      promise = @loginWithProvider(options)

    else
      # Email Login
      # Hull.login({login:'user@host.com', password:'xxxx'})

      # Early return since we're leaving the page.
      return postForm(config.orgUrl+'/api/v1/users/login', 'post', options) if options.strategy=='redirect'
      promise = @api.message('users/login', 'post', _.pick(options, 'login', 'password'))

    @completeLoginPromiseChain(promise,callback,errback)

  logout : (callback, errback) =>
    promise = @api.message('logout')
    .then callback, errback
    # @completeLoginPromiseChain(promise,callback,errback)

  signup : (user,callback, errback) =>
    promise = @api.message('users', 'POST', user)
    @completeLoginPromiseChain(promise, callback, errback)

  linkIdentity   : ()=>
    return getNoUserPromise() unless getUser()
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))
    options.params.mode = 'connect'
    @login(options, callback, errback)

  unlinkIdentity : ()=>
    return getNoUserPromise() unless getUser()
    {options, callback, errback} = parseParams(Array.prototype.slice.call(arguments))
    promise = @api.message("me/identities/#{options.provider}", 'delete')
    @completeLoginPromiseChain(promise,callback,errback)

  completeLoginPromiseChain: (promise, callback,errback)=>
    callback = callback || ->
    errback  = errback  || ->

    p = promise.then @api.refreshUser, @emitLoginFailure
    p.then callback, errback

    p


  emitLoginFailure : (err)->
    EventBus.emit("hull.user.fail", err)
    throw err

module.exports = Auth
