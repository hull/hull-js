define ['jquery-jsonp', 'lib/remote/services/proxy'], (jsonp, proxyBuilder)->
  (app)->
    proxy = proxyBuilder {name: 'instagram', path: 'instagram'}, app.core.handler

    handler = (req, callback, errback)=>

      method = req.method.toLowerCase()
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      requestParams = {}

      instaConfig = app.core.settings().auth?.instagram

      if method == 'get'
        requestParams =
          url: "https://api.instagram.com/v1/" + path
          data: _.extend({}, req.params, instaConfig)
          callbackParameter: 'callback'
        request = jsonp(requestParams)
        request.done (response)->
          callback({ response: response.data, provider: 'instagram', pagination: response.pagination })
        request.fail (err)-> errback(err.url)

      else
        proxy(req, callback, errback)

      return

    initialize: (app)->
      app.core.routeHandlers.instagram = handler
