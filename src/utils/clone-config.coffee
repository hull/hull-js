_         = require './lodash'
clone     = require './clone'

module.exports = (config, remoteConfig)->
  config = clone(config);
  remoteConfig = clone(remoteConfig);
  config.services = remoteConfig.settings
  (key)->
    _cursor = config
    return clone(config) unless key
    _.each key.split('.'), (k)->
      return _cursor if _cursor == undefined
      if _.contains(_.keys(_cursor), k)
        _cursor = _cursor[k]
      else
        _cursor = undefined
    clone(_cursor)

