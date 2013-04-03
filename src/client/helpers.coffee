define ['underscore'], ()->

  (app)->
    
    sandbox = app.sandbox
    core = app.core

    initialize: ->
        sandbox.imageUrl = (id, size="small", fallback="")->
          id = id() if _.isFunction(id)
          return fallback unless id
          id = id.replace(/\/(large|small|medium|thumb)$/,'')
          size = 'small' unless _.isString(size)
          "//#{app.config.assetsUrl}/img/#{id}/#{size}"
