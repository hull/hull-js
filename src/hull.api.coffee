define [
  'underscore'
  'lib/utils/promises',
  'lib/utils/emitter',
  'lib/api/api',
  'lib/api/reporting',
  'lib/utils/entity',
  'lib/utils/config',
  'lib/api/current-user'
  ], (_, promises, emitter, api, reporting, entity, configParser, currentUser)->

    create = (config)->
      _emitter = emitter()
      api.init(config, _emitter).then (api)->
        _reporting = reporting.init(api)
        _emitter.on 'hull.auth.login', (me)->
          #TODO Add the provider used to login
          providers = _.pluck me.identities, 'provider'
          _reporting.track 'hull.auth.login', providers: providers
        _emitter.on 'hull.auth.logout', ()-> _reporting.track('hull.auth.logout')

        noCurentUserDeferred = promises.deferred()
        noCurentUserDeferred.promise.fail(->)
        noCurentUserDeferred.reject(
          reason: 'no_current_user',
          message: 'User must be logged in to perform this action'
        )

        config.services = api.remoteConfig.settings
        created =
          config: configParser(config, _emitter)
          on: _emitter.on
          off: _emitter.off
          emit: _emitter.emit
          track: _reporting.track
          flag: _reporting.flag
          api: api.api
          currentUser: currentUser(_emitter)
          signup: (args...)->
            signupPromise = api.auth.signup(args...)
            signupPromise
          login: (args...)->
            if (api.auth.isAuthenticating())
              return console.info "Authentication is in progress. Use `Hull.on('hull.auth.login', fn)` to call `fn` when done."

            api.auth.login(args...)
          logout: api.auth.logout
          linkIdentity: (provider, options = {}, callback)->
            return noCurentUserDeferred.promise unless created.currentUser()

            options.mode = 'connect'
            created.login(provider, options, callback)
          unlinkIdentity: (provider, callback)->
            return noCurentUserDeferred.promise unless created.currentUser()

            promise = api.api("me/identities/#{provider}", 'delete').then(api.api.bind(api, 'me'))
            promise.then (user)->
              _emitter.emit('hull.auth.login', user)
              callback(user)

            promise
          util:
            entity: entity
            eventEmitter: _emitter
        created.api.create = create
        raw: api
        api: created
        eventEmitter: _emitter

    failure = (error)->
      console.error('Unable to start Hull.api', error.message)
      throw error

    init: (config)-> create(config)
    success: (successResult)->
      exports: successResult.api
      context:
        me: successResult.raw.remoteConfig.data.me
        app: successResult.raw.remoteConfig.data.app
        org: successResult.raw.remoteConfig.data.org
    failure: failure
