define ->
  (app)->
    api = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      url  = "http://#{req.namespace}.hullapp.dev/api/v1/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      headers = {}
      token = app.core.settings().auth?.hull?.credentials?.access_token
      headers['AccessToken'] = token if token

      request = app.core.data.ajax
        url: url
        type: req.method
        data: req_data
        headers: headers

      request.then (response)->
        callback({ response: response, provider: 'admin' })
      , errback

      return

    initialize: (app)->
      app.core.routeHandlers.admin = api
