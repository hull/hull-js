define ['jquery', 'underscore', '../handler'], ($, _, Handler)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//

  (app)->
    # Safari hack: Safari doesn't send response tokens for remote exchange
    accessToken = app.config.access_token
    headers = { 'Hull-App-Id': app.config.appId }

    identified = false
    originalUserId = app.config.data?.me?.id

    identify = (me) ->
      return unless me
      identified = !!me.id?
      return unless identified
      analytics = require('analytics')
      signInCount = me.stats?.sign_in_count || 0

      analytics.alias(me.id) if identified && signInCount == 1

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

      handler.headers['Hull-Access-Token'] = accessToken
      promise = handler.handle
        url: url
        type: options.method
        data: options.params

      promise.then (h) ->
        identify(h.response) if url == '/api/v1/me'

        if accessToken && originalUserId && originalUserId != h.headers['Hull-User-Id']
          accessToken = undefined

        h.provider = 'hull'

        success(h) if _.isFunction(success)
      , (h) ->
        error(h.response)
      return

    doTrack = (event, params={})->
      return unless event
      params.hull_app_id    = app.config?.appId
      params.hull_app_name  = app.config?.data?.app?.name
      require('analytics').track(event, params)

    trackAction = (response)->
      return unless track = response.headers['Hull-Track']
      try
        [eventName, trackParams] = JSON.parse(atob(track))
        doTrack(eventName, trackParams)
      catch error
        console.warn 'Invalid Tracking header'
        "Invalid Tracking header"

    trackHandler = (req, callback, errback)->
      eventName = req.path
      doTrack(eventName, req.params)
      req.params.event ?= eventName
      req.params = { t: btoa(JSON.stringify(req.params)) }
      handler.headers['Hull-Access-Token'] = accessToken
      promise = handler.handle
        url: normalizePath 't'
        type: req.method || 'post'
        data: req.params
      promise.then (h)->
        h.provider = 't'
        callback(h)
      , (err)->
        errback(err.response)
      return

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

      identify(app.config.data.me) if app.config.data.me?

      doTrack("hull.app.init")
      app.core.routeHandlers.hull = hullHandler
      app.core.routeHandlers.track = trackHandler
