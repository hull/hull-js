define ['jquery', 'underscore'], ($, _)->

  (app)->

    config = app.config

    identified = false

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

    handler = (req, route, callback, errback)=>
      path = req.path.replace(/^\/?hull\//, '')
      path = path.substring(1) if (path[0] == "/")
      url  = "/api/v1/" + path

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

      _headers = ['Hull-User-Id', 'Hull-User-Sig']

      request.done (response)->
        identify(_.clone(response)) if path == 'me'
        headers = {}
        _.map _headers, (h)-> headers[h] = request.getResponseHeader(h)
        callback({ response: response, headers: headers })

      request.fail(errback)

      return

    trackHandler = (req, route, callback, errback)->
      analytics = require('analytics')
      eventName = req.path.replace(/^track\//, '')

      analytics.track(eventName, req.params)

      req.path = "t"
      req.params.event ?= eventName
      req.params = { t: btoa(JSON.stringify(req.params)) }
      handler(req, route, callback, errback)

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

      analytics.track("init", { appId: config.appId })
      app.core.services.add([ { path: 'hull/*path',  handler: handler } ])
      app.core.services.add([ { path: 'track/*path', handler: trackHandler } ])

