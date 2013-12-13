define ['underscore'], (_)->
  ###
  # Parses the parameters for an API call. At this point, they can have two forms
  # * [String, ...] where the String is an uri. The request will be made to the default provider
  # * [Object, ...] where the Object describes more completely the request. It must provide a "path" key, can provide a "provider" key as well as some default parameters in the "params" key
  # In the second form, the optional params can be overridden through parameters at data.api calls
  #
  # The normalized form is the first one.
  #
  # @param {Array} the parameters for the API calls
  # @return {Array} The normalized form of parameters
  ###
  defaultProvider = 'hull'

  _stringDescription = (desc)->
    [desc, defaultProvider, {}]

  _objectDescription = (desc)->
    path      = desc.path
    provider  = desc.provider || defaultProvider
    params    = desc.params || {}
    [path, provider, params]

  parse: (argsArray)->
    description = argsArray.shift()

    [path, provider, params] = _stringDescription(description) if _.isString(description)
    [path, provider, params] = _objectDescription(description) if _.isObject(description)

    throw 'No URI provided for the API call' unless path

    path        = path.substring(1) if path[0] == "/"

    ret         = []
    ret.push(params) if params?
    ret = ret.concat(argsArray)

    callback = errback = null
    params = {}

    while (next = ret.shift())
      type = typeof next
      if type == 'string' && !method
        method = next.toLowerCase()
      else if (type == 'function' && (!callback || !errback))
        if !callback
          callback = next
        else if (!errback)
          errback = next
      else if (type == 'object')
        params = _.extend(params, next)
      else
        throw new TypeError("Invalid argument passed to Hull.api(): " + next)

    method ?= 'get'
    callback ?= ->
    errback  ?= (data)-> console.error('The request has failed: ', data)

    [{ provider: provider, path: path, method: method, params: params }, callback, errback]

