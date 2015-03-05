assign            = require 'object-assign'
_                 = require '../../utils/lodash'
cookies           = require '../../utils/cookies'
EventBus          = require '../../utils/eventbus'
promises          = require '../../utils/promises'
clone             = require '../../utils/clone'
GenericService    = require './generic_service'

class FacebookService extends GenericService
  name : 'facebook'
  path : 'facebook'
  constructor: (config, gateway)->
    super(config, gateway)
    @loadFbSdk(@getSettings())

  request : (args...)->
    @ensureLoggedIn().then ()=> @performRequest(args...)

  ensureLoggedIn : ()->
    dfd = promises.deferred()
    args = Array.prototype.slice.call(arguments)
    if @fbUser?.status=='connected'
      dfd.resolve()
    else
      FB.getLoginStatus (res)->
        @updateFBUserStatus(res)
        if res.status=='connected' then dfd.resolve() else dfd.reject()
      , true
    # , true ~ Maybe we dont need a roundtrip each time.
    dfd.promise

  performRequest: (request,callback,errback)=>

    path = request.path
    uiAction = /^ui\./.test(path)

    fbErrback = (msg, res)->
      res.time = new Date()
      errback(res)

    fbCallback = @fbRequestCallback(request, {uiAction, path}, callback, errback)

    if path == 'fql.query'
      FB.api({ method: 'fql.query', query: request.params.query },fbCallback)

    else if uiAction
      params = clone(request.params)
      params.method = path.replace(/^ui\./, '')

      @showIframe()
      trackParams = { ui_request_id: utils?.uuid?() || (new Date()).getTime() }
      @track "facebook.#{path}.open", assign({}, request.params, trackParams)

      _.delay =>
        FB.ui params, (response)=>
          path = "facebook.#{path}."
          path += if !response || response.error_code then "error" else "success"
          @track({path, params:assign({}, response, trackParams)})
          fbCallback(response)
      , 100

    else
      FB.api path, request.method, request.params, fbCallback(request, {uiAction:false, path}, callback, fbErrback)


  showIframe : ->
    EventBus.emit('remote.iframe.show') if @fb

  hideIframe : ->
    EventBus.emit('remote.iframe.hide') if @fb

  track : (args...)->
    EventBus.emit('remote.track', args...)

  fbRequestCallback : (request, opts={}, callback, errback) =>
    (response) =>
      @fbUiCallback(request,response,opts.path) if opts.uiAction
      if !response or response?.error
        errorMsg = if (response) then "[Facebook Error] #{response.error.type}  : #{response.error.message}" else "[Facebook Error] Unknown error"
        return errback(errorMsg, { response, request })

      callback({ response, provider: 'facebook' })

  fbUiCallback : (req, res, path)=>
    @hideIframe()
    endpoint = switch path
      when 'ui.apprequests' then 'apprequests'
      when 'ui.share' then 'share'
      when 'ui.feed' then 'feed'
    opts = { path: endpoint, method: 'post', params: res }
    @wrappedRequest(opts)

  updateFBUserStatus: (res)=>
    @fbUser = res

  subscribeToFBEvents : ()->
    return unless FB?.Event?
    FB.Event.subscribe 'auth.statusChange',       @updateFBUserStatus
    FB.Event.subscribe 'auth.authResponseChange', @updateFBUserStatus
    FB.Event.subscribe 'auth.login',              @updateFBUserStatus
    FB.Event.subscribe 'auth.logout',             @updateFBUserStatus

  loadFbSdk: (config)->
    dfd = promises.deferred()
    config = assign({},config,{status:true})
    if config.appId
      fb = document.createElement 'script'
      fb.type = 'text/javascript'
      fb.async = true
      fb.src =  "https://connect.facebook.net/en_US/all.js"
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(fb);
      window.fbAsyncInit = ()=>
        @fb = true
        FB.init config
        FB.getLoginStatus @updateFBUserStatus
        @subscribeToFBEvents()
        dfd.resolve({})
    else 
      dfd.reject({})
    dfd.promise


module.exports = FacebookService
