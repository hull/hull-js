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

  parse: (argsArray)->
    description = argsArray.shift()
    params = {}
    if _.isString(description)
      provider = defaultProvider
      path = description
    if _.isObject(description)
      provider  = description.provider || defaultProvider
      path      = description.path
      params    = description.params

    path        = path.substring(1) if path[0] == "/"
    path        = [provider, path].join("/")

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
    errback  ?= (err, data)-> console.error('The request has failed: ', err, data)

    [{ path: path, method: method, params: params }, callback, errback]
    
