_     = require '../utils/lodash'
clone = require '../utils/clone'
analyticsId = require '../utils/analytics-id'
cookies = require '../utils/cookies'

flattenSettings = (settings, name)->
  nameArray = name.split('_')
  nameArray.pop() if nameArray.length > 1
  [nameArray.join('_'), settings[name] || {}]

applyUserCredentials = (config, creds={})->
  _.each creds, (c, k)->
    return unless _.keys(c).length
    config?[k] ?= {} #Never happens except for `hull`
    config?[k].credentials = c
  config

sortServicesByType = (settings, types)->
  ret = _.map types, (names, type)->
    typeSettings = _.zipObject _.map(names, flattenSettings.bind(undefined, settings))
    [type, typeSettings]
  _.zipObject ret

module.exports = (_config={})->
  config = clone(_config)
  config.debug ?= false

  # This exists because we have 3 endpoints where Credentials and Settings are scattered:
  # - remote.html config.settings
  # - remote.html config.data.credentials
  # - /app/settings
  services       = sortServicesByType config.services.settings, config.services.types
  services.auth ?= {}
  services.auth = applyUserCredentials services.auth, config.data.credentials
  config.services = services
  config.identify = {
    browser: analyticsId.getBrowserId(),
    session: analyticsId.getSessionId()
  }

  config.cookiesEnabled = cookies.enabled()

  config
