define ['lib/utils/promises', 'underscore'], (promises, _) ->

  slice = Array.prototype.slice

  showIframe = ->
  hideIframe = ->
  uiHandlers = {}
  trackHandler = ->
  utils = {}

  ensureLoggedIn = (base) ->
    ->
      args = slice.call(arguments)
      FB.getLoginStatus ->
        base.apply(undefined, args)
      , true

  resp = (req, callback, errback, hideIt) ->
    (res) ->
      hideIframe() if hideIt
      if (res && !res.error)
        callback({ response: res, provider: 'facebook' })
      else
        if (res)
          errorMsg = "[FB Error] " + res.error.type + " : " + res.error.message
        else
          errorMsg = "[FB Error] Unknown error"
        errback(errorMsg, { result: res, request: req })

  api = ensureLoggedIn (req, callback, errback) ->
    path = req.path
    if path == 'fql.query'
      FB.api({ method: 'fql.query', query: req.params.query }, resp(req, callback, errback))
    else if /^ui\./.test(path)
      prms = _.clone(req.params)
      prms.method = path.replace(/^ui\./, '')
      showIframe()
      cb = resp(req, callback, errback, true)
      uiHandler = uiHandlers[path] || ->
      trackParams = { ui_request_id: utils?.uuid?() || (new Date()).getTime() }
      trackHandler({ path: "facebook.#{req.path}.open", params: _.extend({}, req.params, trackParams) })
      _.delay ->
        FB.ui prms, (response)->
          path = "facebook.#{req.path}."
          if response.error_code
            path += "error"
          else
            path += "success"

          trackHandler({ path: "facebook.#{req.path}.error", params: _.extend({}, response, trackParams) })
          uiHandler(req, response)
          cb(response)
      , 100
    else
      FB.api path, req.method, req.params, resp(req, callback, (msg, res)-> res.time = new Date(); callback(res))
  


  initialize: (app)->
    fb = document.createElement 'script'
    fb.type = 'text/javascript'
    fb.async = true
    fb.src =  "https://connect.facebook.net/en_US/all.js"
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(fb);

    showIframe = ->
      app.core.mediator.emit('remote.iframe.show')

    hideIframe = ->
      app.core.mediator.emit('remote.iframe.hide')

    dfd = promises.deferred()

    window.fbAsyncInit = ()->
      FB.init app.config.settings.auth.facebook
      dfd.resolve({})

    app.core.routeHandlers.facebook = ()->
      args = arguments
      dfd.promise.then ()->
        api.apply(undefined, args)
      undefined

    uiHandlers['ui.apprequests'] = (req, res)->
      opts = { path: 'services/facebook/apprequests', method: 'post', params: res }
      noop = ->
      app.core.routeHandlers.hull(opts, noop, noop)
    
    uiHandlers['ui.share'] = (req, res)->
      opts = { path: 'services/facebook/share', method: 'post', params: res }
      noop = ->
      app.core.routeHandlers.hull(opts, noop, noop)

    trackHandler = app.core.routeHandlers.track
    utils = app.core.util
