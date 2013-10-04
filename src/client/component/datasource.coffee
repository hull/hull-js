define ['lib/client/datasource', 'underscore'], (Datasource, _)->
  onDataError = (datasourceName, err)->
    console.log "An error occurred with datasource #{datasourceName}", err
  module =
    initialize: (app)->
      default_datasources =
        me: new Datasource app.core.data.api.model('me')
        app: new Datasource app.core.data.api.model('app')
        org: new Datasource app.core.data.api.model('org')

      app.components.before 'initialize', (options)->
        @datasources = _.extend {}, default_datasources, @datasources, options.datasources
        _.each @datasources, (ds, i)=>
          ds = _.bind ds, @ if _.isFunction ds
          @datasources[i] = new Datasource(ds, @api) unless ds instanceof Datasource

      app.components.before 'render', ()->
        @data ?= {}
        keys = _.keys(@datasources)
        promiseArray  = _.map keys, (k)=>
          ds = @datasources[k]
          ds.parse(_.extend({}, @, @options || {}))
          handler = @["on#{_.string.capitalize(_.string.camelize(k))}Error"]
          handler = onDataError unless _.isFunction(handler)
          handler = _.bind(handler, @) if _.isFunction(handler)
          ds.fetch().then (res)=>
            @data[k] = if res.toJSON then res.toJSON() else res
          , (err)->
            handler(k, err)
        @sandbox.data.when(promiseArray...)

  module
