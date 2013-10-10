define ()->
  module = 
    initialize: (app)->
      app.components.before 'beforeRender', (template, data)->
        dfd = @sandbox.data.deferred()
        try
          templateDeferred = @sandbox.template.load(@templates, @ref, @el)
          templateDeferred.done (tpls)=>
            @_templates     = tpls
          templateDeferred.fail (err)=>
            console.error("Error in Building Render Context", err.message, err)
            @renderError.call(@, err.message, err)
            dfd.reject err
          templateDeferred.done ()->
            dfd.resolve ctx
        catch e
          console.error("Caught error in buildContext", e.message, e)
          dfd.reject(e)
        dfd.promise()
  module
