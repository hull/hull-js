define [
  'lib/utils/emitter'
  'lib/api/api'
  'lib/api/reporting',
  'lib/utils/entity'
  ], (emitter, api, reporting, entity) ->
    success = (api)->
      reporting = reporting.init(api)
      booted =
        on: emitter.on
        off: emitter.off
        emit: emitter.emit
        track: reporting.track
        flag: reporting.flag
        data:
          api: api.api
        auth:
          login: api.auth.login
          logout: api.auth.logout
        login: api.auth.login
        logout: api.auth.logout
        util:
          entity: entity

      # Execute Hull.init callback
      booted.emit('hull.init')
      booted

    failure = (error)->

    condition = (config)-> api.init(config)

    condition: condition
    success: success
    failure: failure
