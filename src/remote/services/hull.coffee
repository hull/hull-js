define ['jquery', 'underscore', '../handler'], ($, _, Handler)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//

  (app)->
    accessToken = app.config.access_token
    headers = { 'Hull-App-Id': app.config.appId }
    headers['Hull-Access-Token'] = accessToken if accessToken?

    identified = false
    originalUserId = app.config.data?.me?.id

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

    handler = new Handler(headers: headers)

    hullHandler = (options, success, error) ->
      url = normalizePath(options.path)

      promise = handler.handle
        url: url
        type: options.method
        data: options.params

      promise.then (h) ->
        identify(h.response) if url == '/api/v1/me'

        if accessToken && originalUserId && originalUserId != h.headers['Hull-User-Id']
          accessToken = null

        h.provider = 'hull'

        success(h) if _.isFunction(success)
      , (h) ->
        error(h.response)

      return

    doTrack = (event, params={})->
      return unless event
      params.hull_app_id    = config?.appId
      params.hull_app_name  = config?.data?.app?.name
      require('analytics').track(event, params)

    trackAction = (response)->
      return unless track = response.headers['Hull-Track']
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
      app.core.routeHandlers.hull = hullHandler
      app.core.routeHandlers.track = trackHandler
