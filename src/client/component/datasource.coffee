define ['lib/client/datasource', 'underscore', 'string'], (Datasource, _)->
  module =
    datasourceModel: Datasource

    getDatasourceErrorHandler: (name, scope)->
      handler = scope["on#{_.string.capitalize(_.string.camelize(name))}Error"]
      handler = module.defaultErrorHandler unless _.isFunction(handler)
      _.bind(handler, scope, name)

    defaultErrorHandler: (datasourceName, err)->
      console.warn "An error occurred with datasource #{datasourceName}", err.status, err.statusText

    # Adds datasources to the instance of the component
    addDatasources: (datasources)->
      @datasources ?= {}
      _.each datasources, (ds, i)=>
        ds = _.bind ds, @ if _.isFunction ds
        ds = new module.datasourceModel(ds, @api) unless ds instanceof module.datasourceModel
        @datasources[i] = ds

    # Fetches all the datasources for the instance of the component
    fetchDatasources: ()->
      context = [].pop.apply(arguments)
      @data ?= {}
      promiseArray  = _.map @datasources, (ds, k)=>
        ds.parse(_.extend({}, @, @options || {}))
        handler = module.getDatasourceErrorHandler(k, @)
        context.addDatasource(k, ds.fetch(), handler).then (res)=>
          @data[k] = if res?.toJSON then res.toJSON() else res
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

      app.components.after 'buildContext', module.fetchDatasources

  module
