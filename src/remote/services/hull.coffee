define ['jquery', 'underscore'], ($, _)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//
  RESPONSE_HEADER = ['Hull-User-Id', 'Hull-User-Sig', 'Link']

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

      request = $.ajax
        url: url
        type: req.method
        data: req_data
        contentType: 'application/json'
        dataType: 'json'
        headers: request_headers

      request.done (response)->
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

      request.fail(errback)
      trackHandler({path: req.method, params: req}) unless req.path == 't' or ['get'].indexOf(req.method?.toLowerCase()) != -1

      return

    trackHandler = (req, callback, errback)->
      analytics = require('analytics')
      eventName = req.path

      analytics.track(eventName, req.params)

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

      analytics.track("init", { appId: app.config.appId })
      app.core.routeHandlers.hull = handler
      app.core.routeHandlers.track = trackHandler
