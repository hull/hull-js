define [
  'underscore'
  'lib/utils/emitter',
  'lib/api/api',
  'lib/api/reporting',
  'lib/utils/entity',
  'lib/utils/config',
  'lib/api/current-user'
  ], (_, emitter, api, reporting, entity, configParser, currentUser)->

    create = (config)->
      _emitter = emitter()
      api.init(config, _emitter).then (api)->
        _reporting = reporting.init(api)
        _emitter.on 'hull.auth.login', (me)-> _reporting.track('hull.auth.login', me)
        _emitter.on 'hull.auth.logout', ()-> _reporting.track('hull.auth.logout')

        created =
          config: configParser(config, _emitter)
          on: _emitter.on
          off: _emitter.off
          emit: _emitter.emit
          track: _reporting.track
          flag: _reporting.flag
          api: api.api
          currentUser: currentUser(_emitter)
          login: (args...)->
            if (api.auth.isAuthenticating())
              return console.info "Authentication is in progress. Use `Hull.on('hull.auth.login', fn)` to call `fn` when done."

            p = api.auth.login(args...)

            p.fail (error)->
              _emitter.emit('hull.auth.fail', error)

            p2 = p.then ->
              api.api('me')

            p2.then (user)->
              _emitter.emit('hull.auth.login', user)

            p2
          logout: api.auth.logout
          linkIdentity: (provider, opts={}, callback=->)->
            options = _.extend opts, { mode: 'connect' }
            created.login provider, options, callback
          unlinkIdentity: (provider, callback=->)->
            promise = api.api("me/identities/#{provider}", 'delete').then(api.api.bind(api, 'me'))
            promise.then callback
            promise.then _emitter.emit.bind(_emitter, 'hull.auth.login')
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
