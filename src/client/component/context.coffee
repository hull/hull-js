define ['underscore', 'lib/utils/promises'], (_, promises)->
  _dfd = promises.deferred

  class Context
    constructor: ()->
      @_context = {}
      @_errors = {}

    add: (name, value)->
      @_context[name] = value
    addDatasource: (name, dsPromise, fallback)->
      fallback = _.bind((->), undefined, name) unless _.isFunction(fallback)
      dfd = _dfd()
      dsPromise.then (res)=>
        if _.isFunction res?.toJSON
          @add name, res.toJSON()
        else if _.isArray(res) && res[1] == 'success' && res[2].status == 200
          @add name, res[0]
        else
          @add name, res
        dfd.resolve(res)
      , (err)=>
        @_errors[name] = err
        resolved = fallback err
        @add name, resolved
        dfd.resolve resolved
      dfd
    errors: ->
      countKeys = _.keys(@_errors).length
      return null unless countKeys
      @_errors
    build: ->
      @_context

