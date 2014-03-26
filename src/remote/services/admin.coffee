define ->
  RESPONSE_HEADERS = [
    'Hull-Auth-Scope',
    'Hull-Track',
    'Hull-User-Id',
    'Hull-User-Sig',
    'Link'
  ]

  (app)->
    api = (req, callback, errback) ->
      path = req.path
      path = path.substring(1) if (path[0] == "/")
      top_domain = document.location.host.split('.')
      top_domain.shift()
      url  = "#{document.location.protocol}//#{req.namespace}.#{top_domain.join('.')}/api/v1/" + path
      if req.method.toLowerCase() == 'delete'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      headers = {}
      token = app.core.settings().auth?.hull?.credentials?.access_token
      headers['AccessToken'] = token if token

      request = app.core.data.ajax
        url: url
        type: req.method
        data: req_data
        headers: headers

      request.then (response, status, xhr)->
        # Refactor, 3 duplicates
        # @see handler.coffee
        headers = _.reduce RESPONSE_HEADERS, (memo, name) ->
          value = xhr.getResponseHeader(name)
          memo[name] = value if value?
          memo
        , {}

        callback
          response: response
          provider: 'admin'
          headers: headers
      , errback

      return

    initialize: (app)->
      app.core.routeHandlers.admin = api
