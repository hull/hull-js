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
      core    = env.core
      sandbox = env.sandbox

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
        params = {}

        if (typeof path != 'string')
          throw new TypeError("Invalid path passed to Hull.api() : " + JSON.stringify(path));

        while (next)
          type = typeof next
          if type == 'string' && !method
            method = next.toLowerCase()
          else if (type == 'function' && (!callback || !errback))
            if !callback
              callback = next
            else if (!errback)
              errback = next
          else if (type == 'object')
            params = _.extend(params, next)
          else
            throw new TypeError("Invalid argument passed to Hull.api(): " + next)

          next = args.shift()

        method ?= 'get'

        callback ?= ->
        errback  ?= (err, data)-> console.error('The request has failed: ', err, data)

        ret = [{ path: path, method: method, params: params }, callback, errback]

        ret

      ###
      # Sends the message described by @params to easyXDM
      # @param {Object} contains the provider, uri and parameters for the message
      # @param {Function} optional a success callback
      # @param {Function} optional an error callback
      # @return {Promise}
      ###
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

      ###
      # Normalizes the parameters defining a message. At this point, they can have two forms
      # * [String, ...] where the String is an uri. The request will be made to the default provider
      # * [Object, ...] where the Object describes more completely the request. It must provide a "path" key, can provide a "provider" key as well as some default parameters in the "params" key
      # In the second form, the optional params can be overridden through parameters at data.api calls
      #
      # The normalized form is the first one.
      #
      # @param {Array} the parameters for the API calls
      # @return {Array} The normalized form of parameters
      ###
      normalizeAPIArguments = (argsArray)->
        defaultProvider = 'hull'
        description = argsArray.shift()
        params = {}
        if _.isString(description)
          provider = defaultProvider
          path = description
        if _.isObject(description)
          provider  = description.provider || defaultProvider
          path      = description.path
          params    = description.params

        path        = path.substring(1) if path[0] == "/"
        path        = [provider, path].join("/")
        ret         = [path]
        ret.push(params) if params?
        ret.concat(argsArray)

      exec = (m)->
        method = m
        ()->
          normalizedParams = normalizeAPIArguments (slice.call(arguments))
          args        = extractApiArgs(normalizedParams)
          req         = args[0]
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
        url   = if _.isFunction(model.url) then model.url() else model.url
        verb  = methodMap[method]
        dfd = api(url, verb, model.toJSON())
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
          eventName = ("model.hull." + model._id + '.' + 'change')
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
        models = _.pick(models, 'me', 'app', 'org')

      Model = Backbone.Model.extend
        sync: sync
        url: ->
          if (@id || @_id)
            url = normalizeAPIArguments([@_id || @id])[0]
          else
            url = @collection?.url
          url

      Collection = Backbone.Collection.extend
        model: Model
        sync: sync


      collections = {}

      setupCollection = (path)->
        collection      = new Collection
        collectionURI   = path
        collection.url  = path
        collection.on 'all', ->
          args = slice.call(arguments)
          eventName = ("collection." + collectionURI.replace(/\//g, ".") + '.' + args[0])
          core.mediator.emit(eventName, { eventName: eventName, collection: collection, changes: args[1]?.changes })
        dfd   = collection.deferred = core.data.deferred()
        if collection.models.length > 0
          collection._fetched = true
          dfd.resolve(collection)
        else
          collection._fetched = false
          collection.fetch
            success: ->
              collection._fetched = true
              dfd.resolve(collection)
            error:   ->
              dfd.fail(collection)
        collection

      api.collection = (path)->
        throw new Error('A model must have an path...') unless path?
        throw new Error('You must specify the provider...') if (path.path && !path.provider)
        normalizedArguments = normalizeAPIArguments slice.call(arguments);
        path = normalizedArguments[0]
        collections[path] ?= setupCollection.apply(api, normalizedArguments)
        collections[path]


      api.get     = exec('get')
      api.post    = exec('post')
      api.put     = exec('put')
      api.del     = exec('delete')
      api.batch   = batch

      core.data.api = api
      core.track = (eventName, params)->
        api("track/#{eventName}", 'post', params)

      sandbox.track = (eventName, params)->
        core.track(eventName, params)

      initialized = core.data.deferred()

      onRemoteMessage = -> console.warn("RPC Message", arguments)

      onRemoteReady = (remoteConfig)->
        data = remoteConfig.data
        env.config.services = remoteConfig.services
        env.sandbox.config.services = remoteConfig.services
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

