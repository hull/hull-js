define ['backbone', 'underscore'], (Backbone, _)->

  parseURI = (uri, bindings)->
    placeHolders = uri.match(/(\:[a-zA-Z0-9]+)/g)
    return uri unless placeHolders
    for p in placeHolders
      uri = uri.replace(p, bindings[p.slice(1)]);
    uri

  slice = Array.prototype.slice

  decamelize = (camelCase)->
    camelCase.replace(/([A-Z])/g, '_' + '$1').toLowerCase()

  default_datasources =
    me: 'me'
    app: 'app'
    org: 'org'

  class HullWidget extends Backbone.View

    actions: {}

    initialize: ->

    refreshEvents: ['model.hull.me.change']

    constructor: (options)->
      @ref    = options.ref
      @api    = @sandbox.data.api
      @track  = @sandbox.track
      try
        @events = if _.isFunction(@events) then @events() else @events
        @events ?= {}
        @events["click [data-hull-action]"] = 'actionHandler'

        # Building actions hash
        @actions = if _.isFunction(@actions) then @actions() else @actions
        @actions ?= {}
        @actions.login ?= (source, e, options)=> @sandbox.login(options.provider, options)
        @actions.logout ?= => @sandbox.logout()

        unless @className?
          @className = "hull-widget"
          @className += " hull-#{@namespace}" if @namespace?
        _.each _.functions(@actions), (f)=> @actions[f] = _.bind(@actions[f], @)
        @datasources = _.extend({}, default_datasources, @datasources || {}, options.datasources || {})
        @sandbox.on(refreshOn, (=> @refresh()), @) for refreshOn in (@refreshEvents || [])
      catch e
        console.error("Error loading HullWidget", e)
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
          if _.isString(ds)
            uri = ds
            completeURI = parseURI(uri, @)
            isModel = uri.lastIndexOf('/') in [-1, 0]
            if isModel
              @sandbox.data.api.model(completeURI).deferred
            else
              @sandbox.data.api.collection(completeURI).deferred
          else if _.isFunction(ds)
            ds.call(@)
          else if ds.provider && ds.path #@TODO Enhance check
            type = ds.type || 'collection'
            ds.path = parseURI(ds.path, @)
            if type == 'model'
              @sandbox.data.api.model(ds).deferred
            else if type == 'collection'
              @sandbox.data.api.collection(ds).deferred
            else
              throw new TypeError('Unknown type: ' + type);
          else
            ds

        widgetDeferred = $.when.apply($, promises)

        templateDeferred = @sandbox.template.load(@templates, @ref)

        $.when(widgetDeferred, templateDeferred).done (data, tpls)=>
          args = data
          _.map keys, (k,i)=>
            @datasources[k] = args[i]
            if _.isFunction args[i]?.toJSON
              ret[k] = args[i].toJSON()
            else
              ret[k] = args[i]
          ret.loggedIn    = @loggedIn()
          ret.renderCount = @_renderCount
          @_templates     = tpls
          dfd.resolve(ret)

      catch e
        console.error("Caught error in buildContext", e)
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
      ret = @renderTemplate(@getTemplate(tpl, data), data)
      @$el.addClass(this.className)
      @$el.html(ret)
      return @

    actionHandler: (e)=>
      try
        source  = $(e.currentTarget)
        action  = source.data("hull-action")
        fn = @actions[action] || @["#{action}Action"]
        unless _.isFunction(fn)
          throw new Error("Can't find action #{action} on this Widget")
        options = {}
        options[decamelize(k).replace("hull_", "")] = v for k,v of source.data()
        fn.call(@, source, e, options)
      catch e
        console.error("oops... missed action?", e)

    afterRender: (data)=> data


    # Build render context from datasources
    # Call beforeRender
    # doRender
    # afterRender
    # Start nested widgets...
    render: (tpl, data)=>
      ctx = @buildContext.call(@)
      ctx.fail (err)-> console.error("Error building context: ", err)
      ctx.then (ctx)=>
        $.when(@beforeRender.call(@, ctx)).done (data)=>
          throw new Error("beforeRender must return the data !") unless data?
          @doRender(tpl, data)
          _.defer(@afterRender.bind(@, data))
          _.defer((-> @sandbox.start(@$el)).bind(@))

    refresh: =>
      @render()


  (env)->
    env.core.registerWidgetType("Hull", HullWidget.prototype)




