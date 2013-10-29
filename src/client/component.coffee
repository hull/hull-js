define ['jquery', 'underscore', 'lib/client/component/context', 'lib/utils/promises'], ($, _, Context, promises)->

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
        ctx


      loggedIn: =>
        return false unless @sandbox.data.api.model('me').id?
        identities = {}
        _.map @sandbox.data.api.model('me').get("identities"), (i)->
          identities[i.provider] = i
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
        @invokeWithCallbacks('buildContext').then((ctx)=>
          return @invokeWithCallbacks 'beforeRender', ctx.build(), ctx.errors()
        ).then (dataAfterBefore)=>
          #FIXME SRSLY need some clarification
          data = _.extend(dataAfterBefore || ctx.build(), @data, data)
          @doRender(tpl, data)
          _.defer(@afterRender.bind(@, data))
          _.defer((-> @sandbox.start(@$el, { reset: true })).bind(@))
          @isInitialized = true;
          # debugger
          @emitLifecycleEvent('render')
        , @renderError.bind(@)

      emitLifecycleEvent: (name)->
        @sandbox.emit("hull.#{@componentName.replace('/','.')}.#{name}",{cid:@cid})

    (app)->
      debug = app.config.debug
      app.components.addType("Hull", HullComponent.prototype)
