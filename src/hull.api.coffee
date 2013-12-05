define [
  'lib/utils/emitter'
  'lib/api/api'
  'lib/api/reporting'
  ], (emitter, api, reporting) ->
    success = (api)->
      reporting = reporting.init(api)
      booted = 
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

      # Execute Hull.init callback
      booted.events.emit('hull.init')
      booted

    failure = (error)->

    condition = (config)-> api.init(config)

    condition: condition
    success: success
    failure: failure
