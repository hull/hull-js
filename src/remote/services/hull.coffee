define ['jquery', 'underscore'], ($, _)->

  (env)->

    config = env.config

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

      request.done((res)-> callback(res))
      request.fail(errback)

      return

    trackHandler = (req, route, callback, errback)->
      eventName = req.path.replace(/^track\//, '')
      analytics.track(eventName, req.params)
      req.path    = "t"
      req.params.event ?= eventName
      req.params  = { t: btoa(JSON.stringify(req.params)) }
      handler(req, route, callback, errback)

    config:
      require:
        paths:
          analytics: 'analytics/analytics'
          base64:    'base64/base64'
        shim:
          analytics: { exports: 'analytics' }

    init: (env)->
      analytics = require('analytics')
      analyticsSettings = {}

      _.map env.config.services.types.analytics, (s)->
        _service = env.config.services.settings[s]
        analyticsSettings[_service.name] = _service

      analytics.initialize(analyticsSettings)
      if env.config.data.me?.id?
        me = env.config.data.me
        ident = _.pick(me, 'name', 'email', 'id', 'picture')
        ident.distinct_id = me.id
        ident.$name       = me.name
        analytics.identify(env.config.data.me.id, ident)

      analytics.track("init", { appId: config.appId })
      env.core.services.add([ { path: 'hull/*path', handler: handler } ])
      env.core.services.add([ { path: 'track/*path',    handler: trackHandler } ])

