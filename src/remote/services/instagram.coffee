define ->
  (app)->
    slice = Array.prototype.slice

    handler = (req, callback, errback)=>
      path = req.path.replace(/^\/?instagram\//, '')
      path = path.substring(1) if (path[0] == "/")
      url  = "/api/v1/services/instagram/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      request = $.ajax
        url: url
        type: req.method
        data: req_data
        headers:
          'Hull-App-Id': app.config.appId

      request.done((response)-> callback({ response: response, provider: 'instagram' }))
      request.fail(errback)

      return

    initialize: (app)->
      app.core.routeHandlers.instagram = handler
