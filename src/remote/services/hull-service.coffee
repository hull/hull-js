define ['jquery', 'underscore'], ($, _)->

  (env)->

    config = env.config.services.hull

    handler = (req, route, callback, errback)=>
      path = req.path.replace(/^\/?hull\//, '')
      path = path.substring(1) if (path[0] == "/")
      url  = config.baseUrl + "/" + path

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      request = $.ajax
        url: url
        type: req.method
        data: req_data
        headers:
          'Hull-App-Id': config.appId

      request.done((res)-> callback(res or {}))
      request.fail(errback)

      return

    init: (env)->
      env.core.services.add([ { path: 'hull/*path', handler: handler } ])

