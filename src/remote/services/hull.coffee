define ['jquery', 'underscore', '../handler'], ($, _, Handler)->
  (app)->
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

    handler = app.core.handler

    hullHandler = (options, success, error) ->
      promise = handler.handle
        url: options.path
        type: options.method
        data: options.params

      promise.then (h) ->
        identify(h.response) if h.request.url == '/api/v1/me'

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
    handler.after trackAction

    trackHandler = (req, callback, errback)->
      eventName = req.path
      doTrack(eventName, req.params)
      req.params.event ?= eventName
      req.params = { t: btoa(JSON.stringify(req.params)) }
      promise = handler.handle
        url: 't'
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
      settings = app.config.settings.analytics || {}
      analyticsSettings = {}
      _.each settings, (s)->
        analyticsSettings[s.name] = s

      analytics.initialize analyticsSettings

      identify(app.config.data.me) if app.config.data.me?

      doTrack("hull.app.init")
      app.core.routeHandlers.hull = hullHandler
      app.core.routeHandlers.track = trackHandler
