Promise           = require('es6-promise').Promise
assign            = require '../../polyfills/assign'
_                 = require '../../utils/lodash'
cookies           = require '../../utils/cookies'
EventBus          = require '../../utils/eventbus'
clone             = require '../../utils/clone'
GenericService    = require './generic-service'

FB_EVENTS = ["auth.authResponseChanged", "auth.statusChange", "auth.login", "auth.logout", "comment.create", "comment.remove", "edge.create", "edge.remove", "message.send", "xfbml.render"]

class FacebookService extends GenericService
  name : 'facebook'
  path : 'facebook'
  constructor: (config, gateway)->
    super(config, gateway)
    @loadFbSdk(@getSettings())

  request : (args...)=>
    @ensureLoggedIn().then ()=> @performRequest(args...)

  ensureLoggedIn : ()=>
    self = this
    new Promise (resolve, reject)=>
      args = Array.prototype.slice.call(arguments)
      if @fbUser?.status=='connected'
        resolve()
      else
        FB.getLoginStatus (res)=>
          self.updateFBUserStatus(res)
          if res.status=='connected' then resolve() else reject()
        , true
      # , true ~ Maybe we dont need a roundtrip each time.

  performRequest: (request, callback, errback) =>
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
      @track {event:"facebook.#{path}.open", params:assign({}, request.params, trackParams)}

      setTimeout ()=>
        FB.ui params, (response)=>
          event = "facebook.#{path}."
          event += if !response || response.error_code then "error" else "success"
          @track {event, params:assign({}, response, trackParams)}
          fbCallback(response)
      , 100

    else
      FB.api path, request.method, request.params, @fbRequestCallback(request, {isUICall:false, path}, callback, fbErrback)


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
      callback({ body: response, provider: 'facebook' })

  fbUiCallback : (req, res, path)=>
    @hideIframe()
    opts = { path: path, method: 'post', params: res }
    @wrappedRequest(opts)

  updateFBUserStatus: (res)=>
    @fbUser = res

  subscribeToFBEvents : ()=>
    return unless FB?.Event?
    self = this
    _.map FB_EVENTS, (event)=>
      FB.Event.subscribe event, (args...)=>
        if event.indexOf('auth.')>-1
          self.updateFBUserStatus(args...)
        EventBus.emit("fb.#{event}", args...)


  loadFbSdk: (config)->
    new Promise (resolve, reject)=>
      config = _.omit(assign({},config,{status:true}), 'credentials')
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
          resolve({})
      else
        reject({})


module.exports = FacebookService
