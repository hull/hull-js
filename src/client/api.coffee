define ['lib/version', 'lib/hullbase', 'lib/client/api/params'], (version, base, apiParams) ->

  (app) ->

    models = {}

    clearModelsCache =->
      models = _.pick(models, 'me', 'app', 'org')

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


      # Builds the URL used by easyXDM
      # Based upon the (app) configuration
      buildRemoteUrl: (config)->
        remoteUrl = "#{config.orgUrl}/api/v1/#{config.appId}/remote.html?v=#{version}"
        remoteUrl += "&js=#{config.jsUrl}"  if config.jsUrl
        remoteUrl += "&uid=#{config.uid}"   if config.uid
        remoteUrl += "&access_token=#{config.appSecret}" if config.appSecret
        remoteUrl += "&user_hash=#{config.userHash}" if config.userHash != undefined
        remoteUrl

      initialize: (app)->
        core    = app.core
        sandbox = app.sandbox

        _         = require('underscore')
        Backbone  = require('backbone')
        easyXDM   = require('easyXDM')

        slice = Array.prototype.slice


        #
        #
        # Strict API
        #
        #


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

        # Main method to request the API
        api = -> message.apply(api, apiParams.parse(slice.call(arguments)))

        # Method-specific function
        _.each ['get', 'post', 'put', 'delete'], (method)->
          api[method] = ()->
            args = apiParams.parse (slice.call(arguments))
            req         = args[0]
            req.method  = method
            message.apply(api, args)

        core.data.api = api
        core.track = sandbox.track = (eventName, params)->
          core.data.api({provider:"track", path: eventName}, 'post', params)


        #
        #
        # Current user management
        #
        #


        app.core.setCurrentUser = setCurrentUser = (headers={})->
          return unless app.config.appId
          cookieName = "hull_#{app.config.appId}"
          currentUserId = app.core.currentUser?.id
          if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
            val = btoa(JSON.stringify(headers))
            $.cookie(cookieName, val, path: "/")
            if currentUserId != headers['Hull-User-Id']
              app.core.currentUser = {
                id:   headers['Hull-User-Id'],
                sig:  headers['Hull-User-Sig']
              }
              app.core.mediator.emit('hull.currentUser', app.core.currentUser)
          else
            $.removeCookie(cookieName, path: "/")
            app.core.currentUser = false
            app.core.mediator.emit('hull.currentUser', app.core.currentUser) if currentUserId

          app.sandbox.config ?= {}
          app.sandbox.config.curentUser = app.core.currentUser




        #
        #
        # Models/Collection related
        #
        #


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
          rawFetch(attrs, false)

        rawFetch = (attrs, raw)->
          attrs = { _id: attrs } if _.isString(attrs)
          attrs._id = attrs.path unless attrs._id
          throw new Error('A model must have an identifier...') unless attrs?._id?
          models[attrs._id] || setupModel(attrs, raw || false)

        generateModel = (attrs, raw) ->
          _Model = if raw then RawModel else Model
          if attrs.id || attrs._id
            model = new _Model(attrs)
          else
            model = new _Model()

        setupCollection = (path)->
          route           = (apiParams.parse [path])[0]
          collection      = new Collection
          collection.url  = path
          collection.on 'all', ->
            args = slice.call(arguments)
            eventName = ("collection." + route.path.replace(/\//g, ".") + '.' + args[0])
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
          fullPath = apiParams.parse([path])[0].path
          setupCollection.call(api, path)

        api.batch = ->
          err = new Error 'Incorrect arguments passed to Hull.data.api.batch(). Only Arrays, callback and errback are accepted.'
          args      = slice.call(arguments)
          promises  = []
          requests  = []
          responses = []
          callback  = errback = null
          arg       = null

          # # Parsing the arguments...
          while (arg = args.shift())
            type = typeof arg
            if (type == 'function')
              if !callback
                callback = arg
              else if !errback
                errback = arg
              else
                throw err
            else
              throw err unless _.isArray(arg)
              requests.push(arg)

          throw new Error('No request given. Aborting') unless requests.length
          promises = _.map requests, (request)->
            api.apply(api, request).promise()


          # Actual request
          res = core.data.when.apply(undefined, promises)
          res.then(callback, errback)
          res


        #
        # Initialization
        #

        initialized = core.data.deferred()

        onRemoteMessage = -> console.warn("RPC Message", arguments)

        timeout = setTimeout(
          ()->
            initialized.reject('Remote loading has failed. Please check "orgUrl" and "appId" in your configuration. This may also be about connectivity.')
          , 30000)

        onRemoteReady = (remoteConfig)->
          data = remoteConfig.data

          if data.headers && data.headers['Hull-User-Id']
            app.core.currentUser = {
              id:   data.headers['Hull-User-Id'],
              sig:  data.headers['Hull-User-Sig']
            }

          window.clearTimeout(timeout)
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
          app.sandbox.isAdmin             = remoteConfig.access_token?
          for m in ['me', 'app', 'org', 'entity']
            attrs = data[m]
            if attrs
              attrs._id = m
              rawFetch(attrs, true)

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

        app.core.mediator.emit  'hull.currentUser', app.core.currentUser
        app.core.mediator.on    'hull.currentUser', clearModelsCache

    module
