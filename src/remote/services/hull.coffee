define ['jquery', 'underscore'], ($, _)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//
  RESPONSE_HEADER = ['Hull-User-Id', 'Hull-User-Sig', 'Link', 'Hull-Track', 'Hull-Auth-Scope']

  (app)->

    config = app.config
    identified = false
    accessToken     = app.config.access_token
    originalUserId  = app.config.data?.me?.id

    # Stores calls to flushCall, and processes them at once.
    batchable = (opts) ->
      delay                                = opts.delay
      timeout                              = null
      batchMinSize                         = opts.minSize
      batchMaxSize                         = opts.maxSize 
      requests                             = []
      request_headers                      = { 'Hull-App-Id': config.appId }
      request_headers['Hull-Access-Token'] = accessToken if accessToken

      flush = ()->
        timeout = null
        flushedRequests = _.first(requests,batchMaxSize)
        requests = _.rest(requests,batchMaxSize)
        return if flushedRequests.length == 0

        if flushedRequests.length<=batchMinSize

          $.ajax(flushedRequests[0].request).then (response, status, request)->

            headers = _.reduce RESPONSE_HEADER, (memo, name) ->
              value = request.getResponseHeader(name)
              memo[name] = value if value?
              memo
            , {}

            flushedRequests[0].deferred.resolve({response:response, headers:headers})
          , (error)->
            flushedRequests[0].deferred.reject(error)
        else
          formatted_request =
            ops: _.map(flushedRequests, (r)-> 
              req = r.request 
              return {
                url: req.url
                method: req.type
                params: req.data
                headers: req.headers
              })
            sequential:true

          req = 
            url:  '/api/v1/batch'
            type: 'post'
            data: JSON.stringify(formatted_request)
            contentType: 'application/json'
            headers: request_headers
            dataType: 'json'

          # Apply stored params to flush call
          $.ajax.call(this, req).then (responses)->
            _.each responses.results, (response, i)->
              response.response = JSON.parse(response.body)

              # response.headers = _.reduce RESPONSE_HEADER, (memo, name) ->
              #   value = response.headers[name]
              #   memo[name] = value if value?
              #   memo
              # , {}

              flushedRequests[i].deferred.resolve(response)
          , (error)->
            _.map _.pluck(flushedRequests, 'deferred'), (d)-> d.reject(error)

        true

      (request) ->
        context = this;
        deferred = $.Deferred()
  
        # Store one more requests into the request queue
        request.headers = request_headers
        requests.push({ request: request, deferred: deferred })
        # When we call the method, clear the queue

        flush() while requests.length > batchMaxSize
        timeout ?= setTimeout(flush, delay || 30)

        deferred.promise()

    batchableRequest = batchable
      delay:30
      minSize: 1
      maxSize: 10


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

      request = batchableRequest({
        url: url
        type: req.method
        data: req_data
        contentType: 'application/json'
        dataType: 'json'
      })

      request.done (response)->
        identify(_.clone(response.response)) if url == '/api/v1/me'

        if accessToken && originalUserId && originalUserId != response.headers['Hull-User-Id']
          # Reset token if the user has changed...
          accessToken = false

        response.provider = 'hull'
        callback(response) if _.isFunction(callback)

        trackAction(response)

      request.fail(errback)

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
      app.core.routeHandlers.hull = handler
      app.core.routeHandlers.track = trackHandler
