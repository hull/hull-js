define ['jquery', 'underscore'], ($, _)->
  API_PATH = '/api/v1/'
  API_PATH_REGEXP = /^\/?api\/v1\//

  normalizePath = (path) ->
    if API_PATH_REGEXP.test(path)
      return path.replace(API_PATH_REGEXP, API_PATH)

    path = path.substring(1) if path[0] == '/'
    API_PATH + path


  batchable = (threshold, fn) ->
    args = []
    timeout = null

    ->
      context = this
      args.push(Array::slice.call(arguments))

      delayed = ->
        fn.call(context, args)

        timeout = null
        args = []

      clearTimeout(timeout)
      timeout = setTimeout(delayed, threshold)

  handler = class Handler
    RESPONSE_HEADERS = [
      'Hull-Auth-Scope',
      'Hull-Track',
      'Hull-User-Id',
      'Hull-User-Sig',
      'Link'
    ]

    constructor: (options = {}) ->
      @options = options

      @options.min ?= 1
      @options.max ?= 15
      @options.delay ?= 2

      @headers = @options.headers || {}
      @afterCallbacks = []

      @queue = batchable @options.delay, (requests) ->
        @flush(requests)

    handle: (request) ->
      request.url = normalizePath request.url
      d = new $.Deferred()
      @queue(request, d)

      promise = d.promise()
      _.each @afterCallbacks, (cb)->
        promise.then(cb, cb)
      promise

    flush: (requests) ->
      if requests.length <= @options.min
        while requests.length
          [request, deferred] = requests.pop()
          @handleOne(request, deferred)
      else
        @handleMultiple(requests.splice(0, @options.max))
        @flush(requests) if requests.length

    handleOne: (request, deferred) ->
      @ajax(request).then (r, status, xhr) ->
        headers = _.reduce RESPONSE_HEADERS, (memo, name) ->
          value = xhr.getResponseHeader(name)
          memo[name] = value if value?
          memo
        , {}

        deferred.resolve(response: r, headers: headers, request: request)
      , (xhr) ->
        deferred.reject(response: xhr.responseJSON, headers: {}, request: request)

    handleMultiple: (requests) ->
      @ajax({
        type: 'post',
        url: '/api/v1/batch',
        data: @formatBatchParams(requests)
      }).then (r) ->
        for response, i in r.results
          deferred = requests[i][1]

          headers = _.reduce RESPONSE_HEADERS, (memo, name) ->
            value = response.headers[name]
            memo[name] = value if value?
            memo
          , {}

          h = { response: response.body, headers: headers, request: requests[i] }
          if response.status >= 400
            deferred.reject(h)
          else
            deferred.resolve(h)
      , (xhr) ->
        for request in requests
          request[1].reject(response: xhr.responseJSON, headers: {}, request: request)

    after: (fn)->
      @afterCallbacks.push fn
    ajax: (options) ->
      options = $.extend true, options,
        contentType: 'application/json'
        dataType: 'json'
        headers: @headers

      options.type ?= 'get'
      if options.type.toLowerCase() != 'get'
        options.data = JSON.stringify(options.data || {})

      $.ajax(options)

    formatBatchParams: (requests) ->
      data = { sequential: true }
      data.ops = for request in requests
        r = request[0]

        c = {}
        c.method = r.type
        c.url = r.url
        c.params = r.data if r.data?
        c.headers = r.headers if r.headers?

        c

      data
  handler: handler
  initialize: (app)->
    # Safari hack: Safari doesn't send response tokens for remote exchange
    identified = app.config.data.me?.id
    headers = { 'Hull-App-Id': app.config.appId }
    accessToken = app.config.access_token
    headers['Hull-Access-Token'] = accessToken if accessToken

    app.core.handler = new handler headers: headers
    app.core.handler.after (h)->
      delete app.core.handler.headers['Hull-Access-Token']
      userId = h.headers['Hull-User-Id']
      changed = false
      if identified != userId
        identified = userId
        changed = true
      if identified and changed
        app.core.handler.handle(url: 'me/credentials').then (h)->
          app.core.credentials = h.response
        , ()->
          app.core.credentials = {}
      if changed and not identified
        app.core.credentials = {}

