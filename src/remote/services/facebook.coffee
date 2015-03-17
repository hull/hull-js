assign            = require 'object-assign'
_                 = require '../../utils/lodash'
cookies           = require '../../utils/cookies'
EventBus          = require '../../utils/eventbus'
promises          = require '../../utils/promises'
clone             = require '../../utils/clone'
GenericService    = require './generic_service'

FB_EVENTS = ["auth.authResponseChanged", "auth.statusChange", "auth.login", "auth.logout", "comment.create", "comment.remove", "edge.create", "edge.remove", "message.send", "xfbml.render"]

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
    isUICall = (path=='ui' and request.params?.method?)

    fbErrback = (msg, res)->
      res.time = new Date()
      errback(res)

    fbCallback = @fbRequestCallback(request, {isUICall, path}, callback, errback)

    if path == 'fql.query'
      FB.api({ method: 'fql.query', query: request.params.query },fbCallback)

    else if isUICall
      params = clone(request.params)

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
      FB.api path, request.method, request.params, fbCallback(request, {isUICall:false, path}, callback, fbErrback)


  showIframe : ->
    EventBus.emit('remote.iframe.show') if @fb

  hideIframe : ->
    EventBus.emit('remote.iframe.hide') if @fb

  track : (args...)->
    EventBus.emit('remote.track', args...)

  fbRequestCallback : (request, opts={}, callback, errback) =>
    (response) =>
      @fbUiCallback(request,response,opts.path) if opts.isUICall
      if !response or response?.error
        errorMsg = if (response) then "[Facebook Error] #{response.error.type}  : #{response.error.message}" else "[Facebook Error] Unknown error"
        return errback(errorMsg, { response, request })
      callback({ response, provider: 'facebook' })

  fbUiCallback : (req, res, path)=>
    @hideIframe()
    opts = { path: path, method: 'post', params: res }
    @wrappedRequest(opts)

  updateFBUserStatus: (res)=>
    @fbUser = res

  subscribeToFBEvents : ()->
    return unless FB?.Event?

    _.map FB_EVENTS, (event)=>
      FB.Event.subscribe event, (args...)=>
        @updateFBUserStatus(args...) if event.indexOf('auth.')>-1
        EventBus.emit("fb.#{event}", args...)


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
