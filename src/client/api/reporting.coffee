define ['underscore'], (_)->
  module = 
    track: ()->
      @track = (name, data = {}) ->
        defaultData = _.result(@, 'trackingData')
        defaultData = if _.isObject(defaultData) then defaultData else {}
        data = _.extend { id: @id, component: @options.name }, defaultData, data
        @sandbox.track(name, data)

    initialize: (app)->
      core    = app.core
      sandbox = app.sandbox
      core.track = sandbox.track = (eventName, params)->
        core.data.api({provider:"track", path: eventName}, 'post', params)
      core.flag = sandbox.flag = (id)->
        core.data.api({provider:"hull", path:[id, 'flag'].join('/')}, 'post')

      app.components.before 'initialize', module.track

  module

