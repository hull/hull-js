define [
  'lib/utils/emitter'
  'lib/api/api'
  'lib/api/reporting',
  'lib/utils/entity'
  ], (emitter, api, reporting, entity) ->

    create = (config)->
      _emitter = emitter()
      api.init(config).then (api)->
        _reporting = reporting.init(api)
        _emitter.on 'hull.login', (me)-> _reporting.track('hull.login', me)
        _emitter.on 'hull.logout', ()-> _reporting.track('hull.logout')
        created =
          on: _emitter.on
          off: _emitter.off
          emit: _emitter.emit
          track: _reporting.track
          flag: _reporting.flag
          data:
            api: api.api
          login: (args...)->
            api.auth.login(args...).then ()->
              api.api('me').then (me)->
                _emitter.emit 'hull.login', me
            , (err)->
              _emitter.emit 'hull.login.failure', err
          logout: (args...)->
            api.auth.logout(args...).then ()->
              _emitter.emit('hull.logout')
          util:
            entity: entity
            eventEmitter: _emitter
        created.data.api.create = create
        raw: api
        api: created
        eventEmitter: _emitter

    failure = (error)->
      console.error('Unable to start Hull.api', error)
      error

    init: (config)-> create(config)
    success: (successResult)->
      exports: successResult.api
      context:
        me: successResult.raw.remoteConfig.data.me
        app: successResult.raw.remoteConfig.data.app
        org: successResult.raw.remoteConfig.data.org
    failure: failure
