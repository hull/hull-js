define ->

  (env)->

    rpc = false

    config:
      require:
        paths:
          easyXDM: 'easyXDM/easyXDM'
          backbone: 'backbone/backbone'
        shim:
          easyXDM: { exports: 'easyXDM' }
          backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] }

    init: (env)->
      core = env.core
      _         = require('underscore')
      Backbone  = require('backbone')
      easyXDM   = require('easyXDM')

      slice = Array.prototype.slice

      # Stolen from fb sdk
      # https://github.com/facebook/facebook-js-sdk/blob/deprecated/src/core/api.js#L188
      extractApiArgs = (args)->
        callback = errback = null
        path = args.shift()
        next = args.shift()

        if (typeof path != 'string')
          return console.error("Invalid path passed to Hull.api() : ", path)

        while (next)
          type = typeof next
          if type == 'string' && !method
            method = next.toLowerCase()
          else if (type == 'function' && (!callback || !errback))
            if !callback
              callback = next
            else if (!errback)
              errback = next

          else if (type == 'object' && !params)
            params = next
          else
            throw new Error("Invalid argument passed to Hull.api(): " + next)

          next = args.shift()

        method ?= 'get'
        params ?= {}

        callback ?= ->
        errback  ?= (err, data)-> console.error('Uncaught error: ', err, data)

        ret = [{ path: path, method: method, params: params }, callback, errback]

        ret

      message = (params, callback, errback)->
        console.error("Api not initialized yet") unless rpc
        promise = core.data.deferred()

        onSuccess = (res)->
          callback(res)
          promise.resolve(res)

        onError = (err)->
          errback(err)
          promise.reject(err)

        rpc.message params, onSuccess, onError

        promise

      exec = (m)->
        method = m
        (serviceName)->
          args        = extractApiArgs(slice.call(arguments, 1))
          req         = args[0]
          req.path    = req.path.substring(1) if req.path[0] == "/"
          req.path    = [serviceName, req.path].join("/")
          req.method  = method
          message.apply(api, args)

      batch = ->
        args      = slice.call(arguments)
        # next      = args.shift()
        promises  = []
        requests  = []
        responses = []
        callback  = errback = null

        # # Parsing the arguments...
        while (next)
          type = typeof next
          if (type == 'function')
            if !callback
              callback = next
            else if !errback
              errback = next
            else
              throw new Error('Incorrect arguments passed to Hull.batch(). Only callback & errback can be defined.')
          else
            requests.push(next)

          next = args.shift()

        _.map(requests, (request)->
          if _.isString(request)
            req = [{ path: request, method: 'get' }]
          else
            req = [request]
          promises.push(message.apply(api, req))
        )

        # Actual request
        res = core.data.when.apply($, promises)
        res.then(callback, errback)
        res

      api = -> message.apply(api, extractApiArgs(slice.call(arguments)))

      methodMap =
        'create': 'post'
        'update': 'put'
        'delete': 'delete'
        'read':   'get'

      sync = (method, model, options={})->
        url = if _.isFunction(model.url) then model.url() else model.url
        dfd = api(url, methodMap[method], model.toJSON())
        dfd.then(options.success)
        dfd.fail(options.error)
        dfd

      models = {}

      setupModel = (attrs)->
        if attrs.id
          model = new Model(attrs)
        else
          model = new Model()
        model.on 'change', ->
          args = slice.call(arguments)
          eventName = ("hull.model." + model._id + '.' + 'change')
          core.mediator.emit(eventName, { eventName: eventName, model: model, changes: args[1]?.changes })
        dfd   = model.deferred = core.data.deferred()
        model._id = attrs._id
        models[attrs._id] = model
        if model.id
          model._fetched = true
          dfd.resolve(model)
        else
          model._fetched = false
          model.fetch
            success: ->
              model._fetched = true
              dfd.resolve(model)
            error:   ->
              dfd.fail(model)
        model

      api.model = (attrs)->
        attrs = { _id: attrs } if _.isString(attrs)
        throw new Error('A model must have an identifier...') unless attrs?._id?
        models[attrs._id] || setupModel(attrs)


      api.model.clearAll =->
        models = {}

      Model = Backbone.Model.extend
        sync: sync
        url: -> "hull/#{@_id}"

      Collection = Backbone.Collection.extend
        url: -> "hull/#{@_id}"
        sync: sync

      api.collection = (ext)->
        Collection.extend(ext)

      api.get     = exec('get')
      api.post    = exec('post')
      api.put     = exec('put')
      api.del     = exec('delete')
      api.batch   = batch

      core.data.api = api

      initialized = core.data.deferred()

      onRemoteMessage = -> console.warn("RPC Message", arguments)

      onRemoteReady = (data)->
        for m in ['me', 'app', 'org']
          attrs = data[m]
          if attrs
            attrs._id = m
            api.model(attrs)

        initialized.resolve(data)

      rpc = new easyXDM.Rpc({
        remote: "#{env.config.orgUrl}/api/v1/#{env.config.appId}/remote.html"
      }, {
        remote: { message: {}, ready: {} }
        local:  { message: onRemoteMessage, ready: onRemoteReady }
      })

      initialized

