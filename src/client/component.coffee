define ['jquery', 'underscore', 'lib/client/datasource', 'lib/client/component/context', 'lib/utils/promises'], ($, _, Datasource, Context, promises)->

  (app)->
    debug = false

    slice = Array.prototype.slice

    decamelize = (camelCase)->
      camelCase.replace(/([A-Z])/g, '_' + '$1').toLowerCase()

    default_datasources = {}

    class HullComponent extends app.core.mvc.View
      actions: {}

      templates: []

      initialize: ->

      isInitialized: false

      requiredOptions: []

      options: {}

      constructor: (options)->
        @ref = options.ref
        @api = @sandbox.data.api
        @datasources = _.extend {}, default_datasources, @datasources, options.datasources
        @refresh ?= _.throttle(@render, 200)
        @componentName = options.name

        for k, v of @options
          options[k] ||= v

        try
          unless @className?
            @className = "hull-component"
            @className += " hull-#{@namespace}" if @namespace?

          _.each @datasources, (ds, i)=>
            ds = _.bind ds, @ if _.isFunction ds
            @datasources[i] = new Datasource(ds, @api) unless ds instanceof Datasource
        catch e
          console.error "Unable to init component #{@componentName}"


        # Copy/Paste + adaptation of the Backbone.View constructor
        # TODO remove it whenever possible
        @cid = _.uniqueId('view')
        @_configure(options || {})
        @_ensureElement()
        @invokeWithCallbacks('initialize', options).then _.bind(->
          @render()
          @sandbox.on(refreshOn, (=> @refresh()), @) for refreshOn in (@refreshEvents || [])
        , @), (err)->
          # Already displays a log in Aura and is caught above

      renderTemplate: (tpl, data)=>
        _tpl = @_templates?[tpl]
        if _tpl
          _tpl(data || @)
        else
          "Cannot find template '#{tpl}'"

      beforeRender: (data)-> data

      renderError: ->

      log: (msg)=>
        if @options.debug
          console.warn(@options.name, ":", @options.id, msg)
        else
          console.warn("[DEBUG] #{@options.name}", msg, @)

      buildContext: =>
        @_renderCount ?= 0
        ctx = new Context()
        ctx.add 'options', @options
        ctx.add 'loggedIn', @loggedIn()
        ctx.add 'isAdmin', @sandbox.isAdmin
        ctx.add 'debug', @sandbox.config.debug
        ctx.add 'renderCount', ++@_renderCount

        dfd = @sandbox.data.deferred()
        datasourceErrors = {}
        @data = {}
        try
          keys = _.keys(@datasources)
          promiseArray  = _.map keys, (k)=>
            ds = @datasources[k]
            ds.parse(_.extend({}, @, @options || {}))
            handler = @["on#{_.string.capitalize(_.string.camelize(k))}Error"]
            handler = _.bind(handler, @) if _.isFunction(handler)
            ctx.addDatasource(k, ds.fetch(), handler).then (res)=>
              @data[k] = res
          componentDeferred = @sandbox.data.when.apply(undefined, promiseArray)
          templateDeferred = @sandbox.template.load(@templates, @ref, @el)
          templateDeferred.done (tpls)=>
            @_templates     = tpls
          readyDfd = promises.when(componentDeferred, templateDeferred)
          readyDfd.fail (err)=>
            console.error("Error in Building Render Context", err.message, err)
            @renderError.call(@, err.message, err)
            dfd.reject err
          readyDfd.done ()->
            dfd.resolve ctx

        catch e
          console.error("Caught error in buildContext", e.message, e)
          dfd.reject(e)
        dfd.promise()

      loggedIn: =>
        return false unless @sandbox.data.api.model('me').id?
        identities = {}
        _.map @sandbox.data.api.model('me').get("identities"), (i)->
          identities[i.provider] = i
        identities

      getTemplate: (tpl, data)=>
        tpl || @template || @templates[0]

      doRender: (tpl, data)=>
        tplName = @getTemplate(tpl, data)
        ret = @renderTemplate(tplName, data)
        @$el.addClass(this.className)
        ret = "<!-- START #{tplName} RenderCount: #{@_renderCount} -->#{ret}<!-- END #{tplName}-->" if debug
        @$el.html(ret)
        return @

      afterRender: (data)=> data

      # Build render context from datasources
      # Call beforeRender
      # doRender
      # afterRender
      # Start nested components...
      render: (tpl, data)=>
        ctxPromise = @buildContext()
        ctxPromise.fail (err)->
          console.error("Error fetching Datasources ", err.message, err)
        ctxPromise.then (ctx)=>
          try
            beforeCtx = @beforeRender.call(@, ctx.build(), ctx.errors())
            beforeRendering = promises.when(beforeCtx)
            beforeRendering.done (dataAfterBefore)=>
              #FIXME SRSLY need some clarification
              data = _.extend(dataAfterBefore || ctx.build(), data)
              @doRender(tpl, data)
              _.defer(@afterRender.bind(@, data))
              _.defer((=> @sandbox.start(@$el, { reset: true })))
              @isInitialized = true;
              @emitLifecycleEvent('render')
            beforeRendering.fail (err)=>
              console.error("Error in beforeRender on ", this.options.name,  err.message, err)
              @renderError.call(@, err)
          catch err
            console.error("Error in beforeRender on ", this.options.name,  err.message, err)
            @renderError.call(@, err)

      emitLifecycleEvent: (name)->
        @sandbox.emit("hull.#{@componentName.replace('/','.')}.#{name}",{cid:@cid})

    (app)->
      default_datasources =
        me: new Datasource app.core.data.api.model('me')
        app: new Datasource app.core.data.api.model('app')
        org: new Datasource app.core.data.api.model('org')
      debug = app.config.debug
      app.components.addType("Hull", HullComponent.prototype)
