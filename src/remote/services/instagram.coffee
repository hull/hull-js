define ->
  (app)->
    slice = Array.prototype.slice

    handler = (req, callback, errback)=>

      method = req.method.toLowerCase()
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      requestParams = {}

      instaConfig = app.config.services.settings.instagram_app

      if method == 'get'
        requestParams =
          url: "https://api.instagram.com/v1/" + path
          dataType: 'jsonp'
          data: _.extend({}, req.params, instaConfig)
          type: 'get'
        request = $.ajax(requestParams)
        request.done (response)->
          callback({ response: response.data, provider: 'instagram', pagination: response.pagination })
        request.fail(errback)

      else
        url  = "/api/v1/services/instagram/" + path
        if req.method.toLowerCase() == 'delete'
          req_data = JSON.stringify(req.params || {})
        else
          req_data = req.params

        requestParams =
          url: url
          type: req.method
          data: req_data
          headers:
            'Hull-App-Id': app.config.appId

        request = $.ajax(requestParams)
        request.done (response)->
          callback({ response: response, provider: 'instagram' })
        request.fail(errback)

      return

    initialize: (app)->
      app.core.routeHandlers.instagram = handler
