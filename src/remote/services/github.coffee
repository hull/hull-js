define ->
  (app)->
    slice = Array.prototype.slice

    api = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      url  = "https://api.github.com/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      headers = {}

      if app.config.services.settings.github_app?.access_token?
        headers['Authorization'] = "token #{app.config.services.settings.github_app.access_token}"

      request = $.ajax
        url: url
        type: req.method
        data: req_data
        headers: headers


      request.done((response)-> callback({ response: response, provider: 'github' }))
      request.fail(errback)

      return

    initialize: (app)->
      app.core.routeHandlers.github = api
