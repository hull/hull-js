queuedEvents = {}
queuedTracks = {}
window.Hull = Hull = {}

Hull.on   = (evt, fn)->
  queuedEvents[evt] ?= []
  queuedEvents[evt].push fn

Hull.track   = (evtName, params)->
  queuedTracks[evt] ?= []
  queuedTracks[evt].push params

Hull.init = (config, cb, errb)->
  require ['lib/hull.api'], (app)->
    app(config,cb,errb).then (Hull)->
      window.Hull = Hull
      


define [
  'underscore'
  'lib/utils/emitter'
  'lib/api/api'
  'lib/api/auth'
  'lib/api/reporting'
  'lib/utils/entity'
  'lib/utils/promises'
  'lib/utils/version'
  ], (_, emitter, api, auth, reporting,  entity, promises, version) ->

  (config, cb, errb)->
    return cb(Hull) if Hull.config

    # Prepare config
    config.namespace = 'hull'
    config.debug = config.debug && { enable: true }

    promises.all([api.init(config), reporting]).then (results)->
      [api, reporting] = results

      Hull = 
        config: config
        entity: entity
        events: emitter
        version: version
        track: reporting.track
        flag: reporting.flag
        data:
          api: api.api
        auth:
          login: api.auth.login
          logout: api.auth.logout
        login: api.auth.login
        logout: api.auth.logout

      # Execute Hull.init callback
      Hull.events.emit('hull.init')

      # Prune callback queue
      for evt, cbArray of queuedEvents
        for cb of cbArray
          Hull.events.on evt, cb

      Hull.track(evt, params) for evt, param of queuedEvents

      cb(Hull) if cb
      Hull
