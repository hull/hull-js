define ['jquery-jsonp'], (jsonp)->
  initialize: (app)->
    app.core.routeHandlers.angellist = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      req_data = req.params

      return failure('Can only handle GET requests') unless req.method.toLowerCase() == 'get'

      #TODO Double check this
      req_data.access_token = app.core.settings().auth.angellist?.token

      request = jsonp
        url: "https://api.angel.co/1/#{path}"
        data: req_data
        callbackParameter: 'callback'

      request.then (response)->
        callback({ response: response, provider: 'angellist' })
      , (err)-> errback(er.url)

      return
 
