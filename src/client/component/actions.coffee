define ['underscore'], (_)->
  camelize = (str)->
    str.replace /(?:^|[-_])(\w)/g, (m, c)->
      (c && c.toUpperCase()) || ''

  module =
    initialize: (app)->
      app.components.before 'initialize', module.registerActions

    defaultActions: ['login', 'logout', 'linkIdentity', 'unlinkIdentity']

    selectAction: (action, scope)->
      fn = scope.actions[action] || scope["#{action}Action"]
      fn = scope[fn] if _.isString(fn)
      unless _.isFunction(fn)
        throw new Error("Can't find action #{action} on this component")
      fn

    formatActionData: (data)->
      formattedData = {}
      for k,v of data
        do ->
          key = k.replace(/^hull(-)?/, "")
          key = camelize(key)
          key = key.charAt(0).toLowerCase() + key.slice(1)
          formattedData[key] = v
      formattedData

    actionHandler: (e)->
      source  = @sandbox.dom.find(e.currentTarget)
      action  = source.data("hull-action")
      data = module.formatActionData(source.data())
      try
        fn = module.selectAction(action, @)
        fn.call(@, e, { el: source, data: data })
      catch err
        console.error("Error in action handler: ", action, err.message, err)
      finally
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()

    registerActions: ()->
      e = if _.isFunction(@events) then @events() else @events
      @events = _.defaults({
        "click [data-hull-action]": _.bind(module.actionHandler, @)
      }, e)

      # Building actions hash
      @actions = if _.isFunction(@actions) then @actions() else @actions
      @actions ?= {}

      _.each module.defaultActions, (action)->
        @actions[action] ?= (e, params)=>@sandbox[action](params.data.provider, params.data)
      , @

  module
