queuedEvents = {}
queuedTracks = {}
queuedInits  = []
queuedConfig = undefined
Hull         = {}

define [
  'underscore'
  './utils/emitter'
  './api/api'
  './api/auth'
  './api/reporting'
  './utils/entity'
  './utils/promises'
  './utils/version'
  ], (_, emitter, api, auth, reporting,  entity, promises, version) ->

    initSuccess = (results)->
      [api, reporting] = results

      Hull = _.extend Hull, {
        events: emitter
        track: reporting.track
        flag: reporting.flag
        data:
          api: api.api
        auth:
          login: api.auth.login
          logout: api.auth.logout
        login: api.auth.login
        logout: api.auth.logout
      }

      # Execute Hull.init callback
      Hull.events.emit('hull.init')

      # Prune callback queue
      for evt, cbArray of queuedEvents
        for cb of cbArray
          Hull.events.on evt, cb
      queuedEvents = []

      # Prune init queue
      callbacks.cb(Hull) for callbacks of queuedInits
      queuedInits = []

      Hull.track(evt, params) for evt, param of queuedTracks
      queuedTracks = []

      Hull

    initFailure = (error)->
      # Prune init queue
      for callbacks of queuedInits
        callbacks.errb(error)
      queuedInits = []


    init = (config, cb, errb)->
      return cb(Hull) if Hull.config && Hull.data?.api?
      queuedInits.push {
        cb: cb
        errb: errb
      }
      # Only take into account the first config.
      queuedConfig = config unless queuedConfig

      # Prepare config
      queuedConfig.namespace = 'hull'
      queuedConfig.debug = config.debug && { enable: true }

      promises.all([api.init(queuedConfig), reporting]).then(initSuccess, initFailure)
      return promises

    preInitOn   = (evt, fn)->
      queuedEvents[evt] ?= []
      queuedEvents[evt].push fn

    preInitTrack   = (evtName, params)->
      queuedTracks[evt] ?= []
      queuedTracks[evt].push params

    Hull = {
      on:      preInitOn
      track:   preInitTrack
      version: version
      init:    init
    }


    Hull
