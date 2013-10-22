define ['underscore'], (_)->
  actionHandler = (e)->
    try
      source  = $(e.currentTarget)
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

  module = 
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

    delegate: ->
      @delegateEvents()

    initialize: (app)->
      app.components.before 'initialize', module.configure
      app.components.after 'initialize', module.delegate

  module
