define ['underscore'], (_)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//
  RESPONSE_HEADER = ['Hull-User-Id', 'Hull-User-Sig', 'Link', 'Hull-Track', 'Hull-Auth-Scope']

  (app)->

    config = app.config

    identified = false

    accessToken     = app.config.access_token
    originalUserId  = app.config.data?.me?.id

    identify = (me) ->
      return unless me
      analytics = require('analytics')
      signInCount = me.stats?.sign_in_count || 0

      if identified && signInCount == 1
        analytics.alias(me.id)
        identified = true

      ident = _.pick(me, 'name', 'email', 'id', 'picture')
      ident.created = me.created_at
      ident.distinct_id = me.id

      analytics.identify(me.id, ident)

    normalizePath = (path) ->
      if API_PATH_REGEXP.test(path)
        return path.replace(API_PATH_REGEXP, API_PATH)

      path = path.substring(1) if path[0] == '/'
      API_PATH + path

    handler = (req, callback, errback)=>
      url = normalizePath(req.path)

      if req.method.toLowerCase() != 'get'
        req_data = JSON.stringify(req.params || {})
      else
        req_data = req.params

      request_headers = { 'Hull-App-Id': config.appId }
      if accessToken
        request_headers['Hull-Access-Token'] = accessToken

      request = app.core.data.ajax
        url: url
        type: req.method
        data: req_data
        contentType: 'application/json'
        dataType: 'json'
        headers: request_headers

      request.then (response)->
        identify(_.clone(response)) if url == '/api/v1/me'

        headers = _.reduce RESPONSE_HEADER, (memo, name) ->
          value = request.getResponseHeader(name)
          memo[name] = value if value?
          memo
        , {}

        if accessToken && originalUserId && originalUserId != headers['Hull-User-Id']
          # Reset token if the user has changed...
          accessToken = false

        callback({ response: response, headers: headers, provider: 'hull' }) if _.isFunction(callback)

        trackAction(request, response)

      ,  errback

      return

    doTrack = (event, params={})->
      return unless event
      params.hull_app_id    = config?.appId
      params.hull_app_name  = config?.data?.app?.name
      require('analytics').track(event, params)

    trackAction = (request, response)->
      track = request.getResponseHeader('Hull-Track')
      return unless track
      try
        [eventName, trackParams] = JSON.parse(atob(track))
        doTrack(eventName, trackParams)
      catch error
        "Invalid Tracking header"

    trackHandler = (req, callback, errback)->
      eventName = req.path
      doTrack(eventName, req.params)
      req.path = "t"
      req.params.event ?= eventName
      req.params = { t: btoa(JSON.stringify(req.params)) }
      req.method ?= 'post'
      handler(req, callback, errback)

    require:
      paths:
        analytics: 'components/analytics/analytics'
        base64:    'components/base64/base64'

    initialize: (app)->
      analytics = require('analytics')
      analyticsSettings = {}

      _.map app.config.services.types.analytics, (s)->
        _service = app.config.services.settings[s]
        analyticsSettings[_service.name] = _service

      analytics.initialize(analyticsSettings)

      if app.config.data.me?.id?
        identified = true
        identify(app.config.data.me)

      doTrack("hull.app.init")
      app.core.routeHandlers.hull = handler
      app.core.routeHandlers.track = trackHandler
