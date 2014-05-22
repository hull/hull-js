define ['jquery', 'underscore', '../handler'], ($, _, Handler)->
  (app)->

    createOrRefreshUuid = (key, expires) ->
      uuid = app.core.cookies.get(key) || app.core.util.uuid()
      app.core.cookies.set(key, uuid, {
        domain: document.location.host,
        expires: expires
      })

      uuid

    getBrowserId = ->
      year = new Date().getFullYear() + 10
      createOrRefreshUuid('_bid', new Date(year, 0, 1))

    getSessionId = ->
      createOrRefreshUuid('_sid', 30 * 60)

    initInfo =
      url: app.config.data.request.url.href
      path: app.config.data.request.url.path
      $referrer: app.config.data.request.referrer?.href
      referrer: app.config.data.request.referrer?.href
      browser_id: getBrowserId()
      session_id: getSessionId()
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


    class TrackEventMatcher

      constructor: (cfg)->
        if cfg == false || cfg?.ignore?
          @mode = 'ignore'
          @_initMatchers(cfg.ignore)
        else if !cfg?
          @mode = 'match_all'
        else
          @mode = 'match'
          @_initMatchers(cfg?.only || cfg)

      _initMatchers: (m)->
        m = [m] if _.isString(m)
        @matchers = _.map _.compact(m), (c)-> 
          _c = c.toString()
          if /^\/.*\/$/.test(_c)
            new RegExp(_c.slice(1,-1))
          else
            _c

      weTrackIt: (event)->
        return false unless event?
        return true if @mode == 'match_all'
        ret = _.some _.map @matchers, (m)->
          if _.isFunction(m.test)
            m.test(event)
          else
            m == event
        if @mode == 'ignore'
          return !ret
        else
          return ret

    doTrack = (event, params={})->
      return unless app.core.trackMatcher.weTrackIt(event)
      params.hull_app_id    = app.config?.appId
      params.hull_app_name  = app.config?.data?.app?.name
      _.defaults params, initInfo
      require('analytics').track(event, params)

    trackAction = (response)->
      return unless track = response.headers['Hull-Track']
      try
        [eventName, trackParams] = JSON.parse(atob(track))
        doTrack(eventName, trackParams)
      catch error
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
        callback && callback(h)
      , (err)->
        errback && errback(err.response)
      return

    require:
      paths:
        analytics: 'components/analytics/analytics'
        base64:    'components/base64/base64'

    initialize: (app)->

      app.core.trackMatcher = new TrackEventMatcher(app.core.clientConfig.track)

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
