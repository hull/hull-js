define ['lib/utils/promises', 'underscore'], (promises, _) ->

  slice = Array.prototype.slice

  ensureLoggedIn = (base) ->
    ->
      args = slice.call(arguments)
      FB.getLoginStatus ->
        base.apply(undefined, args)
      , true

  resp = (req, callback, errback) ->
    (res) ->
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
    FB.api path, req.method, req.params, resp(req, callback, (msg, res)-> res.time = new Date(); callback(res))

  fql = ensureLoggedIn (req, callback, errback) ->
    FB.api({ method: 'fql.query', query: req.params.query }, resp(req, callback, errback))

  initialize: (app)->
    fb = document.createElement 'script'
    fb.type = 'text/javascript'
    fb.async = true
    fb.src =  "https://connect.facebook.net/en_US/all.js"
    (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(fb);

    fbPool = []
    fqlPool = []

    dfd = promises.deferred()
    window.fbAsyncInit = ()->
      FB.init app.config.settings.auth.facebook
      dfd.resolve({})
    app.core.routeHandlers.fql = ()->
      args = arguments
      dfd.promise.then ()->
        fql.apply(undefined, args)
      undefined
    app.core.routeHandlers.facebook = ()->
      args = arguments
      dfd.promise.then ()->
        api.apply(undefined, args)
      undefined
