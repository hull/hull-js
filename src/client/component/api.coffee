define ['lib/utils/promises'], (promises) ->

  (app) ->

    _ = app.core.util._

    models = {}

    clearModelsCache =-> models = _.pick(models, 'me', 'app', 'org')

    rawFetch  = null
    authScope = null

    module =

      initialize: (app)->
        core    = app.core
        sandbox = app.sandbox

        slice = Array.prototype.slice

        hullApi = core.data.hullApi

        core.data.api = (args...)->
          dfd = hullApi.api( args...)
          dfd.then (res, headers={})->
            if headers?
              hullTrack = headers['Hull-Track']
              if hullTrack
                try
                  [eventName, trackParams] = JSON.parse(atob(hullTrack))
                  core.mediator.emit(eventName, trackParams)
                catch error
                  console.warn 'Error', error
              if headers['Hull-Auth-Scope']
                authScope = headers['Hull-Auth-Scope'].split(':')[0]
          dfd
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

          dfd = core.data.api(url, verb, data)
          dfd.then(options.success)
          dfd.then (resolved)->
            model.trigger('sync', model, resolved, options)
          dfd.fail(options.error)
          dfd.fail (rejected)->
            model.trigger 'error', model, rejected, options
          dfd

        BaseHullModel = core.mvc.Model.extend
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

        Collection = core.mvc.Collection.extend
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

        core.data.api.model = (attrs)->
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
          route           = (core.data.api.parseRoute [path])[0]
          collection      = new Collection
          collection.url  = path
          collection.on 'all', ->
            args = slice.call(arguments)
            eventName = ("collection." + route.path.replace(/\//g, ".") + '.' + args[0])
            core.mediator.emit(eventName, { eventName: eventName, collection: collection, changes: args[1]?.changes })
          dfd   = collection.deferred = promises.deferred()
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

        core.data.api.collection = (path)->
          throw new Error('A model must have an path...') unless path?
          setupCollection.call(core.data.api, path)

        core.data.api.batch = ->
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
            core.data.api.apply(core.data.api, request).promise


          # Actual request
          res = promises.when(promises...)
          res.then(callback, errback)
          res


        #
        # Initialization
        #

        core = core
        sandbox = app.sandbox

        authScope = hullApi.authScope
        remoteConfig = hullApi.remoteConfig
        data = remoteConfig.data
        app.config.assetsUrl            = remoteConfig.assetsUrl
        app.config.services             = remoteConfig.services
        app.components.addSource('hull', remoteConfig.baseUrl + '/aura_components')
        sandbox.config ?= {}
        sandbox.config.debug        = app.config.debug
        sandbox.config.assetsUrl    = remoteConfig.assetsUrl
        sandbox.config.appId        = app.config.appId
        sandbox.config.orgUrl       = app.config.orgUrl
        sandbox.config.services     = remoteConfig.services
        sandbox.config.entity_id    = data.entity?.id


        sandbox.isAdmin = ->
          (authScope == 'Account' || sandbox.data.api.model('me').get('is_admin'))

        sandbox.login = (provider, opts={}, callback=->)->
          hullApi.auth.login.apply(undefined, arguments).then ->
            try
              me = sandbox.data.api.model('me')
              me.fetch().then ->
                core.mediator.emit 'hull.auth.complete', me
                core.mediator.emit 'hull.login', me
            catch err
              console.error "Error on auth promise resolution", err
              core.mediator.emit 'hull.auth.failure', err
          , (err)->
            core.mediator.emit 'hull.auth.failure', err

        # Add a .logout() method to the component sandbox, and emit events when logout is complete
        sandbox.logout = (callback=->)->
          hullApi.auth.logout(callback).then ->
            core.mediator.emit('hull.auth.logout')
            core.mediator.emit('hull.logout')
            core.data.api.model('me').clear()

        # Add a .linkIdenity() method to the component sandbox
        sandbox.linkIdentity = (provider, opts={}, callback=->)->
          opts.mode = 'connect'
          sandbox.login(provider, opts, callback)

        # Add a .unlinkIdenity() method to the component sandbox
        sandbox.unlinkIdentity = (provider, callback=->)->
          core.data.api("me/identities/#{provider}", 'delete').then ->
            app.sandbox.data.api.model('me').fetch().then callback

        # FIXME Does it double with l.247-249?
        for m in ['me', 'app', 'org', 'entity']
          attrs = data[m]
          if attrs
            attrs._id = m
            rawFetch(attrs, true)


      afterAppStart: (app)->
        core    = app.core
        sandbox = app.sandbox

        #TODO, Restores me/app/org in base: (ie, Hull.*)
        rawFetch('me', true);
        rawFetch('app', true);
        rawFetch('org', true);

        core.mediator.on    'hull.login',       clearModelsCache
        core.mediator.on    'hull.logout',      clearModelsCache

        # core.mediator.on    'hull.login',       ->
        #   core.data.hullApi.track 'hull.auth.login',  core.data.api.model('me').toJSON()

        # core.mediator.on    'hull.logout',      ->
        #   core.data.hullApi.track 'hull.auth.logout', core.data.api.model('me').toJSON()

    module
