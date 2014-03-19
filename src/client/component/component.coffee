define ['underscore', 'lib/utils/q2jQuery', 'lib/client/component/context', 'lib/utils/promises'], (_, q2jQuery, Context, promises)->
  _invokeBeforeRender = (data, ctx)->
    dfd = promises.deferred()
    @invokeWithCallbacks('beforeRender', ctx.build(), ctx.errors()).then (_data)=>
      data = _.extend({}, @data, _data || ctx.build(), data)
      dfd.resolve data
    , (err)->
      console.error(err)
      dfd.reject err
    q2jQuery dfd.promise


  (app)->
    debug = false

    class HullComponent extends app.core.mvc.View
      initialize: ->

      isInitialized: false

      options: {}

      constructor: (options)->
        @ref = options.ref
        @api = @sandbox.data.api
        @refresh ?= _.throttle((-> @invokeWithCallbacks 'render' ), 200)
        @componentName = options.name

        for k, v of @options
          options[k] ||= v

        unless @className?
          @className = "hull-component"
          @className += " hull-#{@namespace}" if @namespace?

        # Copy/Paste + adaptation of the Backbone.View constructor
        # TODO remove it whenever possible
        @cid = _.uniqueId('view')
        @_configure(options || {})
        @_ensureElement()
        @invokeWithCallbacks('initialize', options).then _.bind(->
          @delegateEvents()
          @invokeWithCallbacks 'render'
          @sandbox.on('hull.settings.update', (conf)=> @sandbox.config.services = conf)
          @sandbox.on(refreshOn, (=> @refresh()), @) for refreshOn in (@refreshEvents || [])
        , @), (err)->
          console.warn('WARNING', err)
          # Already displays a log in Aura and is caught above

      renderTemplate: (tpl, data)=>
        _tpl = @_templates?[tpl]
        if _tpl
          _tpl data || @, helpers: _.extend {}, @helpers
        else
          "Cannot find template '#{tpl}'"

      authServices: ()->
        @sandbox.util._.reject @sandbox.util._.keys(@sandbox.config.services.auth || {}), (service)-> service == 'hull'

      beforeRender: (data)-> data

      renderError: ->

      log: (msg)=>
        if @options.debug
          console.warn(@options.name, ":", @options.id, msg)
        else
          console.warn("[DEBUG] #{@options.name}", msg, @)

      buildContext: (ctx)=>
        @_renderCount ?= 0
        ctx.add 'options', @options
        ctx.add 'loggedIn', @loggedIn()
        ctx.add 'isAdmin', @sandbox.isAdmin()
        ctx.add 'debug', @sandbox.config.debug
        ctx.add 'renderCount', ++@_renderCount
        ctx

      loggedIn: =>
        return false unless @sandbox.data.api.model('me').get('id')?
        identities = {}
        me = @sandbox.data.api.model('me')
        _.map me.get("identities"), (i)->
          identities[i.provider] = i
        identities.email ?= {} if me.get('main_identity') == 'email'
        identities

      getTemplate: (tpl, data)=>
        tpl || @template || @templates?[0]

      doRender: (tpl, data)=>
        tplName = @getTemplate(tpl, data)
        ret = @renderTemplate(tplName, data)
        @$el.addClass(this.className)
        ret = "<!-- START #{tplName} RenderCount: #{@_renderCount} -->#{ret}<!-- END #{tplName}-->" if debug
        @$el.html(ret)
        return @

      afterRender: (data)=> data

      # Call beforeRender
      # doRender
      # afterRender
      # Start nested components...
      render: (tpl, data)=>
        @invokeWithCallbacks('buildContext', new Context())
        .then(_.bind(_invokeBeforeRender, @, data))
        .then (data)=>
          @invokeWithCallbacks 'doRender', tpl, data
          _.defer(@afterRender.bind(@, data))
          _.defer((-> @sandbox.start(@$el, { reset: true })).bind(@))
          @isInitialized = true;
          # debugger
          @emitLifecycleEvent('render')
        , (err)=>
          console.error(err.message)
          @renderError(err)
      emitLifecycleEvent: (name)->
        @sandbox.emit("hull.#{@componentName.replace('/','.')}.#{name}",{cid:@cid})

    module =
      initialize: (app)->
        debug = app.config.debug
        app.components.addType("Hull", HullComponent.prototype)

    module
