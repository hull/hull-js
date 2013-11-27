define ->
  (app)->
    slice = Array.prototype.slice

    handler = (req, callback, errback)=>
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      url  = "/api/v1/services/twitter/1.1/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      request = app.core.data.ajax
        url: url
        type: req.method
        data: req_data
        headers:
          'Hull-App-Id': app.config.appId

      request.then (response)->
        callback({ response: response, provider: 'twitter' })
      , errback

      return

    initialize: (app)->
      app.core.routeHandlers.twitter = handler
