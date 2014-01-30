define ['underscore'], (_)->

  flattenSettings = (settings, name)->
    [name.replace(/_app$/, ''), settings[name] || {}]

  class ConfigNormalizer
    constructor: (cfg)->
      @config = cfg

    sortServicesByType: (settings, types)->
      ret = _.map types, (names, type)->
        typeSettings = _.object(_.map(names, _.bind(flattenSettings, undefined, settings)))
        [type, typeSettings]
      _.object ret
    applyUserCredentials: (config, creds={})->
      _.each creds, (c, k)->
        return unless _.keys(c).length
        config[k] ?= {} #Never happens except for `hull`
        config[k].credentials = c
    normalize: ()->
      @config.settings = @sortServicesByType @config.services.settings, @config.services.types
      @applyUserCredentials @config.settings.auth, @config.data.credentials
      @config

