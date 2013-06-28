define ['lib/hullbase', 'lib/api'], (base, apiModule) ->

  (app) ->

    models = {}

    clearModelsCache =->
      models = _.pick(models, 'me', 'app', 'org')

    rawFetch = null
    emitUserEvent = null
    module =
      require:
        paths:
          cookie: 'components/jquery.cookie/jquery.cookie'


      initialize: (app)->
        core    = app.core
        sandbox = app.sandbox
        _       = require('underscore')

        slice = Array.prototype.slice


        apiModule.then (obj)->
          core.data.api = obj.api
          core.track = sandbox.track = (eventName, params)->
            core.data.api({provider:"track", path: eventName}, 'post', params)
          core.flag = sandbox.flag = (id)->
            core.data.api({provider:"hull", path:[id, 'flag'].join('/')}, 'post')


          #
          #
          # Current user management
          #
          #

          emitUserEvent = ->
            app.core.mediator.emit('hull.currentUser', app.core.currentUser)





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
            dfd.then (resolved)->
              model.trigger('sync', model, resolved, options)
            dfd.fail(options.error)
            dfd.fail (rejected)->
              model.trigger 'error', model, rejected, options
            dfd

          BaseHullModel = app.core.mvc.Model.extend
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

          Collection = app.core.mvc.Collection.extend
            model: Model
            sync: sync

          setupModel = (attrs, raw)->
            model = generateModel(attrs, raw)
            model.on 'change', ->
              args = slice.call(arguments)
              eventName = ("model.hull." + model._id + '.' + 'change')
              core.mediator.emit(eventName, { eventName: eventName, model: model, changes: args[1]?.changes })
            model._id = attrs._id
            models[attrs._id] = model #caching
            if model.id
              model._fetched = true
            else
              model._fetched = false
              model.fetch
                success: ->
                  model._fetched = true
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
        apiModule.then (obj)->
          remoteConfig = obj.remoteConfig
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

        initialized

      afterAppStart: (app)->

        base.me     = rawFetch('me', true);
        base.app    = rawFetch('app', true);
        base.org    = rawFetch('org', true);

        emitUserEvent()
        app.core.mediator.on    'hull.currentUser', clearModelsCache

    module
