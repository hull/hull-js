define ->
  (app)->
    api = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      top_domain = document.location.host.split('.')
      top_domain.shift()
      url  = "#{document.location.protocol}//#{req.namespace}.#{top_domain.join('.')}/api/v1/" + path
      if req.method.toLowerCase() != 'get'
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
        dataType: 'json'
        headers: headers

      request.then (response)->
        callback({ response: response, provider: 'admin' })
      , errback

      return

    initialize: (app)->
      app.core.routeHandlers.admin = api
