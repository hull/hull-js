_     = require '../utils/lodash'
clone = require '../utils/clone'
analyticsId = require '../utils/analytics-id'

flattenSettings = (settings, name)->
  nameArray = name.split('_')
  nameArray.pop() if nameArray.length > 1
  [nameArray.join('_'), settings[name] || {}]

applyUserCredentials= (config, creds={})->
  _.each creds, (c, k)->
    return unless _.keys(c).length
    config?[k] ?= {} #Never happens except for `hull`
    config?[k].credentials = c
  config

sortServicesByType= (settings, types)->
  ret = _.map types, (names, type)->
    typeSettings = _.zipObject _.map(names, flattenSettings.bind(undefined, settings))
    [type, typeSettings]
  _.zipObject ret

module.exports = (_config={})->
  config = clone(_config)
  config.debug ?= false
  config.settings       = sortServicesByType config.services.settings, config.services.types
  config.settings.auth ?= {}
  config.settings.auth = applyUserCredentials config.settings.auth, config.data.credentials

  config.identify = {
    browser: analyticsId.getBrowserId(),
    session: analyticsId.getSessionId()
  }

  config
