define [
  'underscore'
  './utils/emitter'
  './api/api'
  './api/auth'
  './api/reporting'
  './utils/entity'
  './utils/promises'
  './utils/version'
  './bootstrap'
  ], (_, emitter, api, auth, reporting,  entity, promises, version, bootstrap) ->
    booting = undefined
    success = (api)->
      reporting = reporting.init(api)
      booted = _.extend booting, {
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
      booted.events.emit('hull.init')
      booted

    failure = (error)->

    condition = (config)->
      api.init(config)

    booting = bootstrap(condition, success, failure)
    booting
