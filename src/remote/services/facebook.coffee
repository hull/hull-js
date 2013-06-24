define ->

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

  # The actual extension...
  require:
    paths:
      facebook: "https://connect.facebook.net/en_US/all"
    shim:
      facebook: { exports: 'FB' }

  initialize: (app)->
    dfd = app.core.data.deferred()
    FB.init(app.config.services.settings.facebook_app)
    FB.getLoginStatus dfd.resolve
    app.core.routeHandlers.fql = fql
    app.core.routeHandlers.facebook = api
    dfd
