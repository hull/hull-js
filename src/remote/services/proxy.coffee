define ->
  (service, transport)->
    (req, callback, errback)=>
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      url  = "services/#{service.path}/#{path}"

      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      request = transport.handle
        url: url
        type: req.method
        data: req_data

      request.then (response)->
        response.provider = service.name
        callback response
      , errback

      return

