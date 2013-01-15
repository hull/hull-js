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

    trackHandler = (req, route, callback, errback)->
      analytics.track(req.params.path, req.params)
      callback(true)

    config:
      require:
        paths:
          analytics: 'analytics/analytics'
        shim:
          analytics: { exports: 'analytics' }

    init: (env)->
      analytics = require('analytics')
      analytics.initialize(config.settings.analytics)
      if env.config.data.me?.id?
        console.warn("env config data ?", env.config.data.me)
        analytics.identify(env.config.data.me.id)
        analytics.track("init", { appId: config.appId })
      env.core.services.add([ { path: 'hull/*path', handler: handler } ])
      env.core.services.add([ { path: 'track/*path',    handler: trackHandler } ])

