define ['backbone', 'underscore'], (Backbone, _)->

  Datasource = null
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
      unless _.isFunction(fn)
        throw new Error("Can't find action #{action} on this Widget")
      options = {}
      for k,v of source.data()
        do ->
          key = k.replace(/^hull/, "")
          key = key.charAt(0).toLowerCase() + key.slice(1)
          options[key] = v
      fn.call(@, source, e, options)
    catch e
      console.error("oops... missed action?", e.message, e)
    finally
      e.stopPropagation()
      e.stopImmediatePropagation()


  class HullWidget extends Backbone.View

    actions: {}
    templates: []

    initialize: ->

    constructor: (options)->
      @ref          = options.ref
      @api          = @sandbox.data.api
      @track        = @sandbox.track
      @datasources  = _.extend {}, default_datasources, @datasources, options.datasources

      try
        @events = if _.isFunction(@events) then @events() else @events
        @events ?= {}
        @events["click [data-hull-action]"] = actionHandler

        # Building actions hash
        @actions = if _.isFunction(@actions) then @actions() else @actions
        @actions ?= {}
        @actions.login ?= (source, e, options)=> @sandbox.login(options.provider, options)
        @actions.logout ?= => @sandbox.logout()

        unless @className?
          @className = "hull-widget"
          @className += " hull-#{@namespace}" if @namespace?

        _.each @datasources, (ds, i)=>
          ds = _.bind ds, @ if _.isFunction ds
          @datasources[i] = new Datasource ds unless ds instanceof Datasource

        @sandbox.on(refreshOn, (=> @refresh()), @) for refreshOn in (@refreshEvents || [])
      catch e
        console.error("Error loading HullWidget", e.message)
      Backbone.View.prototype.constructor.apply(@, arguments)
      @render()

    renderTemplate: (tpl, data)=>
      _tpl = @_templates?[tpl]
      if _tpl
        _tpl(data || @)
      else
        "Cannot find template '#{tpl}'"

    beforeRender: (data)-> data

    log: (msg)=>
      if @options.debug
        console.warn(@options.name, ":", @options.id, msg)
      else
        console.warn("[DEBUG] #{@options.name}", msg, @)

    buildContext: =>
      @_renderCount ?= 0
      @_renderCount++
      ret       = {}
      dfd       = @sandbox.data.deferred()
      try
        keys      = _.keys(@datasources)
        promises  = _.map keys, (k)=>
          ds = @datasources[k]
          ds.parse(_.extend({}, @, @options || {}))
          ds.fetch()

        widgetDeferred = @sandbox.data.when.apply(undefined, promises)
        templateDeferred = @sandbox.template.load(@templates, @ref)
        @data = {}
        $.when(widgetDeferred, templateDeferred).done (data, tpls)=>
          args = data
          _.map keys, (k,i)=>
            @data[k] = args[i]
            if _.isFunction args[i]?.toJSON
              ret[k] = args[i].toJSON()
            else
              ret[k] = args[i]
          ret.loggedIn    = @loggedIn()
          ret.debug       = @sandbox.config.debug
          ret.renderCount = @_renderCount
          @_templates     = tpls
          dfd.resolve(ret)

      catch e
        console.error("Caught error in buildContext", e.message, e)
        dfd.reject(e)
      dfd

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
      @refresh ?= _.throttle(@render, 200)
      ctx = @buildContext.call(@)
      ctx.fail (err)-> console.error("Error building context: ", err.message, err)
      ctx.then (ctx)=>
        beforeCtx = @beforeRender.call(@, ctx)
        $.when(beforeCtx).done (dataAfterBefore)=>
          data = _.extend(dataAfterBefore || ctx, data)
          @doRender(tpl, data)
          _.defer(@afterRender.bind(@, data))
          _.defer((-> @sandbox.start(@$el)).bind(@))

  (app)->
    Datasource = app.core.datasource
    default_datasources =
      me: new Datasource 'me'
      app: new Datasource 'app'
      org: new Datasource 'org'
    debug = app.config.debug
    app.core.registerWidgetType("Hull", HullWidget.prototype)
