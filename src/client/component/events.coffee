define ['underscore', 'jquery'], (_, $)->
  actionHandler = (e)->
    source  = $(e.currentTarget)
    action  = source.data("hull-action")
    try
      handler = module.getActionHandler(action, @)
      data = module.cleanUpData source.data()
      context = { el: source, data: data }
      handler.call(@, e, context, @)
    catch err
      console.error("Error in action handler: ", action, err.message, err)
    finally
      e.preventDefault()
      e.stopPropagation()
      eventName = "#{action}.#{@componentName}.hull"
      @$el.trigger eventName, context, @

  module = 
    getActionHandler: (action, target)->
      fn = target.actions[action] || target["#{action}Action"]
      fn = target[fn] if _.isString(fn)
      unless _.isFunction(fn)
        throw new Error("Can't find action #{action} on the component #{target.componentName}")
      fn
    cleanUpData: (data)->
      cleanData = {}
      for k,v of data
        do ->
          key = k.replace(/^hull/, "")
          key = key.charAt(0).toLowerCase() + key.slice(1)
          cleanData[key] = v
      cleanData
    configure: (options)->
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

      _.each @actions, (action, key)=>
        splitActionName = key.split('.')
        return if splitActionName.length < 2
        actionName = splitActionName.pop()
        @$el.on [actionName].concat(splitActionName).concat('hull').join('.'), _.bind(action, @)

    delegate: ->
      @delegateEvents()

    initialize: (app)->
      app.components.before 'initialize', module.configure
      app.components.after 'initialize', module.delegate

  module
