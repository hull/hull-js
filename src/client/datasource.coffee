define ['lib/utils/promises', 'underscore', 'backbone'], (promises, _, Backbone)->

  # Parses the "Link" header
  #
  # @param {String} header the link header
  # @return {Object} links the pagination links
  parseLinkHeader = (header) ->
    links = {}
    header.replace /<([^>]*)>;\s*rel="([\w]*)\"/g, (match, url, rel) ->
      links[rel] = url

    links

  parseQueryString = (path) ->
    path = path.split('?')[1] || path

    params = {}
    path.replace /([^?&=]+)(=([^&]*))?/g, (match, key, $, value) ->
      params[key] = value if value?

    params

  #
  # Parses the URI to replace placeholders with actual values
  #
  parseURI = (uri, bindings)->
    placeHolders = uri.match(/(\:[a-zA-Z0-9-_]+)/g)
    return uri unless placeHolders
    for p in placeHolders
      _key = p.slice(1)
      unless _.has(bindings, _key)
        throw new Error "Cannot resolve datasource binding #{p}"
      uri = uri.replace(p, bindings[_key]);
    uri

  #
  # Helps managing the various definitions a component datasource can take
  # Sets decent defaults, validates input, and sends requests to the API
  #
  class Datasource
    #
    # @param {String|Object|Function} A potentially partial definition of the datasource
    #
    constructor: (ds, transport) ->
      if (ds instanceof Backbone.Model || ds instanceof Backbone.Collection)
        @def = ds
        return
      @transport = transport
      _errDefinition  = new TypeError('Datasource is missing its definition. Cannot continue.')
      _errTransport   = new TypeError('Datasource is missing a transport. Cannot continue.')
      throw _errDefinition unless ds
      throw _errTransport unless @transport
      if _.isString(ds)
        ds =
          path: ds
          provider: 'hull'
      else if _.isObject(ds) && !_.isFunction(ds)
        throw _errDefinition unless ds.path
        ds.provider = ds.provider || 'hull'
      @def = ds

    #
    # Replaces the placeholders in the URI with actual data
    # @param {Object} bindings Key/Value pairs to replace the placeholders wih their values
    #
    parse: (bindings) ->
      unless (@def instanceof Backbone.Model || @def instanceof Backbone.Collection)
        @def.path = parseURI(@def.path, bindings) unless _.isFunction(@def)

    #
    # Send the requests.
    # If the definition of the datasource is a function,
    # this function is executed.aUseful for static datasources or second-order datasources
    #
    # @returns {mixed} May return an object, a Promise most likely or anything else
    #
    fetch: ()->
      dfd = promises.deferred()
      if (@def instanceof Backbone.Model || @def instanceof Backbone.Collection)
        dfd.resolve @def
      else if _.isFunction(@def)
        ret = @def()
        if ret?.promise
          dfd = ret
        else
          dfd.resolve ret
      else
        if /undefined/.test(@def.path)
          dfd.resolve(false)
          return dfd.promise()
        transportDfd = @transport(@def)
        transportDfd.then (obj, headers) =>
          if _.isArray(obj)
            @paginationLinks = parseLinkHeader(headers['Link'])
            dfd.resolve (new Backbone.Collection obj)
          else
            dfd.resolve (new Backbone.Model obj)
        , (err)->
          dfd.reject err
      dfd.promise()

    isPaginable: ->
      @paginationLinks?

    isFirst: ->
      !@paginationLinks.first

    isLast: ->
      !@paginationLinks.last

    previous: ->
      unless @isFirst()
        @def.path = @paginationLinks.prev

    next: ->
      unless @isLast()
        @def.path = @paginationLinks.next

    sort: (field, direction = 'ASC') ->
      params = parseQueryString(@def.path)
      params.order_by = field + ' ' + direction
      params = _.map params, (v, k) ->
        k + '=' + v

      @def.path = @def.path.split('?')[0] + '?' + params.join('&')

  Datasource
