define ['lib/version', 'lib/hullbase'], (version, base) ->

  (app) ->

    models = {}
    collections = {}

    rpc = false
    rawFetch = null
    module =
      require:
        paths:
          easyXDM: 'components/easyXDM/easyXDM'
          backbone: 'components/backbone/backbone'
          cookie: 'components/jquery.cookie/jquery.cookie'
        shim:
          easyXDM: { exports: 'easyXDM' }
          backbone: { exports: 'Backbone', deps: ['underscore', 'jquery'] }

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
      normalizeArguments: (argsArray)->
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

        ret         = []
        ret.push(params) if params?
        ret = ret.concat(argsArray)

        callback = errback = null
        params = {}

        while (next = ret.shift())
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

        method ?= 'get'
        callback ?= ->
        errback  ?= (err, data)-> console.error('The request has failed: ', err, data)

        [{ path: path, method: method, params: params }, callback, errback]
        
      # Builds the URL used by easyXDM
      buildRemoteUrl: (config)->
        remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
        remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
        remoteUrl += "&uid=#{config.uid}"   if config.uid

      initialize: (app)->
        core    = app.core
        sandbox = app.sandbox

        _         = require('underscore')
        Backbone  = require('backbone')
        easyXDM   = require('easyXDM')

        slice = Array.prototype.slice

        app.core.setCurrentUser = setCurrentUser = (headers={})->
          return unless app.config.appId
          cookieName = "hull_#{app.config.appId}"
          currentUserId = app.core.currentUser?.id
          if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
            val = btoa(JSON.stringify(headers))
            $.cookie(cookieName, val, path: "/")
            if currentUserId != headers['Hull-User-Id']
              app.core.currentUser = {
                id: headers['Hull-User-Id'],
                sig: headers['Hull-User-Sig']
              }
              app.core.mediator.emit('hull.currentUser', app.core.currentUser)
          else
            $.removeCookie(cookieName, path: "/")
            app.core.currentUser = false
            app.core.mediator.emit('hull.currentUser', app.core.currentUser)

          app.sandbox.config ?= {}
          app.sandbox.config.curentUser = app.core.currentUser

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
            if res.provider == 'hull' && res.headers
              setCurrentUser(res.headers)
            callback(res.response)
            promise.resolve(res.response)

          onError = (err)->
            errback(err)
            promise.reject(err)

          rpc.message params, onSuccess, onError

          promise



        api = -> message.apply(api, module.normalizeArguments(slice.call(arguments)))

        methodMap =
          'create': 'post'
          'update': 'put'
          'delete': 'delete'
          'read':   'get'

        sync = (method, model, options={})->
          url   = if _.isFunction(model.url) then model.url() else model.url
          verb  = methodMap[method]

          data = options.data
          if !data? && model && (method == 'create' || method == 'update' || method == 'patch')
            data = options.attrs || model.toJSON(options)

          dfd = api(url, verb, data)
          dfd.then(options.success)
          dfd.fail(options.error)
          dfd

        setupModel = (attrs, raw)->
          model = generateModel(attrs, raw)
          model.on 'change', ->
            args = slice.call(arguments)
            eventName = ("model.hull." + model._id + '.' + 'change')
            core.mediator.emit(eventName, { eventName: eventName, model: model, changes: args[1]?.changes })
          dfd   = model.deferred = core.data.deferred()
          model._id = attrs._id
          models[attrs._id] = model #caching
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
          getFromCacheOrCreate(attrs, false)

        rawFetch = getFromCacheOrCreate = (attrs, raw)->
          attrs = { _id: attrs } if _.isString(attrs)
          attrs._id = attrs.path unless attrs._id
          throw new Error('A model must have an identifier...') unless attrs?._id?
          models[attrs._id] || setupModel(attrs, raw || false)

        # Clears the cache
        app.core.mediator.on 'hull.currentUser', (hasUser)->
          if (!hasUser)
            models = _.pick(models, 'me', 'app', 'org')
            collections = {}

        generateModel = (attrs, raw) ->
          _Model = if raw then RawModel else Model
          if attrs.id
            model = new _Model(attrs)
          else
            model = new _Model()

        BaseHullModel = Backbone.Model.extend
          sync: sync

        RawModel = BaseHullModel.extend
          url: ->
            @_id || @id

        Model = BaseHullModel.extend
          url: ->
            if (@id || @_id)
              url = @_id || @id
            else
              url = @collection?.url
            url

        Collection = Backbone.Collection.extend
          model: Model
          sync: sync


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
          col = setupCollection.apply(api, slice.call arguments)
          path = module.normalizeArguments([path])[0].path
          collections[path] ?= col
          collections[path]

        api.batch = ->
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


        _.each ['get', 'post', 'put', 'delete'], (method)->
          api[method] = ()->
            args = module.normalizeArguments (slice.call(arguments))
            req         = args[0]
            req.method  = method
            message.apply(api, args)

        core.data.api = api
        core.track = (eventName, params)->
          core.data.api({provider:"track", path: eventName}, 'post', params)

        sandbox.track = (eventName, params)->
          core.track(eventName, params)

        initialized = core.data.deferred()

        onRemoteMessage = -> console.warn("RPC Message", arguments)

        timeout = setTimeout(
          ()->
            initialized.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')
          , 30000)

        onRemoteReady = (remoteConfig)->
          window.clearTimeout(timeout)
          data = remoteConfig.data
          app.config.assetsUrl            = remoteConfig.assetsUrl
          app.config.services             = remoteConfig.services
          app.config.widgets.sources.hull = remoteConfig.baseUrl + '/widgets'
          app.sandbox.config ?= {}
          app.sandbox.config.debug        = app.config.debug
          app.sandbox.config.assetsUrl    = remoteConfig.assetsUrl
          app.sandbox.config.appId        = app.config.appId
          app.sandbox.config.orgUrl       = app.config.orgUrl
          app.sandbox.config.services     = remoteConfig.services
          app.sandbox.config.entity_id    = data.entity?.id
          for m in ['me', 'app', 'org', 'entity']
            attrs = data[m]
            if attrs
              attrs._id = m
              getFromCacheOrCreate(attrs, true)

          initialized.resolve(data)

        initialized.reject(new TypeError 'no organizationURL provided. Can\'t proceed') unless app.config.orgUrl
        initialized.reject(new TypeError 'no applicationID provided. Can\'t proceed') unless app.config.appId

        rpc = new easyXDM.Rpc({
          remote: module.buildRemoteUrl(app.config)
        }, {
          remote: { message: {}, ready: {} }
          local:  { message: onRemoteMessage, ready: onRemoteReady }
        })

        initialized

      afterAppStart: (app)->
        base.me     = rawFetch('me', true);
        base.app    = rawFetch('app', true);
        base.org    = rawFetch('org', true);
        app.core.mediator.emit('hull.currentUser', app.core.currentUser)
    module
