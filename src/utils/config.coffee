define ['underscore'], (_)->
  dirtyClone = (obj)->
    return JSON.parse(JSON.stringify(obj)) unless obj == undefined
  configParser = (config)->
    (key)->
      _cursor = config
      return dirtyClone(config) unless key
      _.each key.split('.'), (k)->
        return _cursor if _cursor == undefined
        if _.contains(_.keys(_cursor), k)
          _cursor = _cursor[k]
        else
          _cursor = undefined
      dirtyClone(_cursor)
  (config)->
    configParser(config)
