_     = require '../utils/lodash'
clone = require '../utils/clone'
cookies = require '../utils/cookies'
qs = require '../utils/query-string-encoder'

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
    typeSettings = _.fromPairs _.map(names, (name)->flattenSettings(settings,name))
    [type, typeSettings]
  _.fromPairs ret

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

  config.cookiesEnabled = cookies.enabled()

  config.queryParams = qs.decode() || {}

  config
