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

      req_data.access_token = app.config.services.settings.angellist_app?.access_token

      request = $.ajax
        url: url
        type: req.method
        data: req_data
        dataType: 'jsonp'
        headers: headers

      request.done((response)-> callback({ response: response, provider: 'angellist' }))
      request.fail(errback)

      return

    initialize: (app)->
      app.core.routeHandlers.angellist = api
