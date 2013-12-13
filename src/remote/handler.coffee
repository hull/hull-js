define ['jquery', 'underscore'], ($, _)->
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

  class Handler
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

      @queue = batchable @options.delay, (requests) ->
        @flush(requests)

    handle: (request) ->
      d = new $.Deferred()
      @queue(request, d)

      d.promise()

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

        deferred.resolve(response: r, headers: headers)
      , (xhr) ->
        deferred.reject(response: xhr.responseJSON, headers: {})

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

          h = { response: response.body, headers: headers }
          if response.status >= 400
            deferred.reject(h)
          else
            deferred.resolve(h)
      , (xhr) ->
        for request in requests
          request[1].reject(response: xhr.responseJSON, headers: {})

    ajax: (options) ->
      options = $.extend true, options,
        contentType: 'application/json'
        dataType: 'json'
        headers: @headers

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
