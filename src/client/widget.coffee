define ['jquery', 'underscore', 'lib/client/datasource', 'lib/client/widget/context', 'lib/utils/promises'], ($, _, Datasource, Context, promises)->

  (app)->
    debug = false

    slice = Array.prototype.slice

    decamelize = (camelCase)->
      camelCase.replace(/([A-Z])/g, '_' + '$1').toLowerCase()

    default_datasources = {}

    actionHandler = (e)->
      try
        source  = $(e.currentTarget)
        action  = source.data("hull-action")
        fn = @actions[action] || @["#{action}Action"]
        fn = @[fn] if _.isString(fn)
        unless _.isFunction(fn)
          throw new Error("Can't find action #{action} on this Widget")
        data = {}
        for k,v of source.data()
          do ->
            key = k.replace(/^hull/, "")
            key = key.charAt(0).toLowerCase() + key.slice(1)
            data[key] = v
        fn.call(@, e, { el: source, data: data })
      catch err
        console.error("Error in action handler: ", action, err.message, err)
      finally
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()


    class HullWidget extends app.core.mvc.View
      actions: {}

      templates: []

      initialize: ->

      isInitialized: false

      constructor: (options)->
        @ref          = options.ref
        @api          = @sandbox.data.api
        @datasources  = _.extend {}, default_datasources, @datasources, options.datasources
        @refresh     ?= _.throttle(@render, 200)
        @widgetName   = options.name

        for k, v of @options
          options[k] ||= v

        try
          @events = if _.isFunction(@events) then @events() else @events
          @events ?= {}
          @events["click [data-hull-action]"] = _.bind actionHandler,@

          # Building actions hash
          @actions = if _.isFunction(@actions) then @actions() else @actions
          @actions ?= {}
          @actions.login ?= (e, params)=> @sandbox.login(params.data.provider, params.data)
          @actions.linkIdentity ?= (e, params)=> @sandbox.linkIdentity(params.data.provider, params.data)
          @actions.unlinkIdentity ?= (e, params)=> @sandbox.unlinkIdentity(params.data.provider)
          @actions.logout ?= => @sandbox.logout()

          unless @className?
            @className = "hull-widget"
            @className += " hull-#{@namespace}" if @namespace?

          _.each @datasources, (ds, i)=>
            ds = _.bind ds, @ if _.isFunction ds
            @datasources[i] = new Datasource(ds, @api) unless ds instanceof Datasource

          @sandbox.on(refreshOn, (=> @refresh()), @) for refreshOn in (@refreshEvents || [])
        catch e
          console.error("Error loading HullWidget", e.message)
        sb = @sandbox
        getId = ()->
          return @id if @id
          return sb.util.entity.encode(@uid) if @uid
          sb.config.entity_id
        options.id = getId.call(options)
        app.core.mvc.View.prototype.constructor.apply(@, arguments)
        @render()

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
            ctx.addDatasource(k, ds.fetch(), handler).then (res)=>
              @data[k] = res
          widgetDeferred = @sandbox.data.when.apply(undefined, promiseArray)
          templateDeferred = @sandbox.template.load(@templates, @ref)
          templateDeferred.done (tpls)=>
            @_templates     = tpls
          readyDfd = promises.when(widgetDeferred, templateDeferred)
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
        @sandbox.data.api.model('me').get("identities").map (i)-> identities[i.provider] = i
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
      # Start nested widgets...
      render: (tpl, data)=>
        ctxPromise = @buildContext.call(@)
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
              _.defer((-> @sandbox.start(@$el)).bind(@))
              @isInitialized = true;
              # debugger
              @emitLifecycleEvent('render')
            beforeRendering.fail (err)=>
              console.error("Error in beforeRender on ", this.options.name,  err.message, err)
              @renderError.call(@, err)
          catch err
            console.error("Error in beforeRender on ", this.options.name,  err.message, err)
            @renderError.call(@, err)

      trackingData: {}

      emitLifecycleEvent: (name)->
        @sandbox.emit("hull.#{@widgetName.replace('/','.')}.#{name}",{cid:@cid})


      track: (name, data = {}) ->
        defaultData = _.result(this, 'trackingData')
        defaultData = if _.isObject(defaultData) then defaultData else {}
        data = _.extend { id: @id, widget: @options.name }, defaultData, data
        @sandbox.track(name, data)

    (app)->
      default_datasources =
        me: new Datasource 'me', app.core.data.api
        app: new Datasource 'app', app.core.data.api
        org: new Datasource 'org', app.core.data.api
      debug = app.config.debug
      app.core.registerWidgetType("Hull", HullWidget.prototype)
