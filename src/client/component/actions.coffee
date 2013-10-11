define ['underscore'], (_)->
  module =
    initialize: (app)->
      app.components.before 'initialize', module.registerActions

    defaultActions: ['login', 'logout', 'linkIdentity', 'unlinkIdentity']

    actionHandler: (e)->
      try
        source  = @sandbox.dom.find(e.currentTarget)
        action  = source.data("hull-action")
        fn = @actions[action] || @["#{action}Action"]
        fn = @[fn] if _.isString(fn)
        unless _.isFunction(fn)
          throw new Error("Can't find action #{action} on this component")
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

    defaultActions: ['login', 'logout', 'linkIdentity', 'unlinkIdentity']

    registerEvents: (options)->
      @events = if _.isFunction(@events) then @events() else @events
      @events ?= {}
      @events["click [data-hull-action]"] = _.bind module.actionHandler, @

      # Building actions hash
      @actions = if _.isFunction(@actions) then @actions() else @actions
      @actions ?= {}

      _.each module.defaultActions, (action)->
        @actions[action] ?= (e, params)=>@sandbox[action](params.data.provider, params.data)
      , @

