queuedEvents = {}
queuedTracks = {}
window.Hull = Hull = {}

# _conflicts = {}
# Hull.noConflict = ->
#   for name of _conflicts
#     window[name] = _conflicts[name]

# Allow to queue events so we can store them before the app starts.
# TODO: do the same for Tracking calls.

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
  'lib/utils/entity'
  'lib/utils/reporting'
  'lib/utils/promises'
  'lib/utils/version'
  ], (_, emitter, api, auth, entity, reporting, promises, version) ->

  (config, cb, errb)->
    return cb(Hull) if Hull.config

    # hasConflicts = false
    # for name in ['require', 'define']
    #   _conflicts[name] ||= window[name] if window[name]
    #   if config.useRequire and Hull[name] != window[name]
    #     hasConflicts = true
    #     window[name] = Hull[name]
    # console.log("Setting window.#{name} to Hull.#{name}. Use Hull.noConflict() to revert to previous values.") if hasConflicts and window.console and config.debug

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

      # Execute Hull.init callback
      Hull.events.emit('hull.init')

      # Prune callback queue
      for evt, cbArray of queuedEvents
        for cb of cbArray
          Hull.events.on evt, cb

      Hull.track(evt, params) for evt, param of queuedEvents

      cb(Hull) if cb
      Hull
