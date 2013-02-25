define ['underscore'], (_)->
  api = null

  #@TODO Refactor, code has been C/P'ed from widget.coffee
  decamelize = (camelCase)->
    camelCase.replace(/([A-Z])/g, '_' + '$1').toLowerCase()

  #
  # Parses the URI to replace placeholders with actual values
  #
  parseURI = (uri, bindings)->
    placeHolders = uri.match(/(\:[a-zA-Z0-9-_]+)/g)
    return uri unless placeHolders
    for p in placeHolders
      _key = decamelize(p).slice(1)
      throw new Error "Cannot resolve datasource binding #{p}" unless _.has(bindings, _key)
      uri = uri.replace(p, bindings[_key]);
    uri

  #
  # Helps managing the various definitions a widget datasource can take
  # Sets decent defaults, validates input, and sends requests to the API
  #
  class Datasource
    #
    # @param {String|Object|Function} A potentially partial definition of the datasource
    #
    constructor: (ds) ->
      _err = new TypeError('Missing parameter for Datasource. Cannot continue.')
      throw _err unless ds
      if _.isString(ds)
        ds =
          path: ds
          provider: 'hull'
          type: if (ds.lastIndexOf('/') in [-1, 0]) then 'model' else 'collection'
      else if _.isObject(ds) && !_.isFunction(ds)
        throw _err unless ds.path
        ds.provider = ds.provider || 'hull'
        ds.type = ds.type || 'collection'
      @def = ds

    #
    # Replaces the placeholders in the URI with actual data
    # @param {Object} bindings Key/Value pairs to replace the placeholders wih their values
    #
    parse:(bindings)->
      @def.path = parseURI(@def.path, bindings) unless _.isFunction(@def)

    #
    # Send the requests.
    # If the definition of the datasource is a function,
    # this function is executed.aUseful for static datasources or second-order datasources
    #
    # @returns {mixed} May return an object, a Promise most likely or anything else
    #
    fetch: ()->
      if _.isFunction(@def)
        @def()
      else
        if @def.type == 'model'
          api.model(@def).deferred
        else if @def.type == 'collection'
          api.collection(@def).deferred
        else
          throw new TypeError('Unknown type of datasource: ' + @def.type);
  (app) ->
    api = app.createSandbox().data.api;
    app.core.datasource = Datasource
    return
