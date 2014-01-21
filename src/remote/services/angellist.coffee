define ->
  (app)->
    slice = Array.prototype.slice

    api = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      url  = "https://api.angel.co/1/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params



      headers = {}

      req_data.access_token = app.config.services.credentials.angellist_app?.token

      request = app.core.data.ajax
        url: url
        type: req.method
        data: req_data
        dataType: 'jsonp'
        headers: headers

      request.then (response)->
        callback({ response: response, provider: 'angellist' })
      , errback

      return

    initialize: (app)->
      app.core.routeHandlers.angellist = api
