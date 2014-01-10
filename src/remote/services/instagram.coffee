define ['lib/remote/services/proxy'], (proxyBuilder)->
  (app)->
    slice = Array.prototype.slice
    proxy = proxyBuilder {name: 'instagram', path: 'instagram'}, app.core.handler

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
        proxy(req, callback, errback)

      return

    initialize: (app)->
      app.core.routeHandlers.instagram = handler
