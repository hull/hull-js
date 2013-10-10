define ['lib/client/datasource', 'underscore'], (Datasource, _)->
  onDataError = (datasourceName, err)->
    console.log "An error occurred with datasource #{datasourceName}", err
  module =
    datasourceModel: Datasource
    
    # Adds datasources to the instance of the component
    addDatasources: (datasources)->
      @datasources ?= {}
      _.each datasources, (ds, i)=>
        ds = _.bind ds, @ if _.isFunction ds
        @datasources[i] = new module.datasourceModel(ds, @api) unless ds instanceof module.datasourceModel
    
    # Fetches all the datasources for the instance of the component
    fetchDatasources: ()->
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

    # Registers hooks and creates default datasources
    initialize: (app)->
      default_datasources =
        me: new module.datasourceModel app.core.data.api.model('me')
        app: new module.datasourceModel app.core.data.api.model('app')
        org: new module.datasourceModel app.core.data.api.model('org')

      app.components.before 'initialize', (options)->
        datasources = _.extend {}, default_datasources, @datasources, options.datasources
        module.addDatasources.call(@, datasources)

      app.components.before 'render', module.fetchDatasources

  module
