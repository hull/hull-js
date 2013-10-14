define ()->
  module =
    initialize: (app)->
      app.components.after 'beforeRender', module.getTemplates

    getTemplates: ()->
      templateDeferred = @sandbox.template.load(@templates, @ref, @el)
      templateDeferred.done (tpls)=>
        @_templates     = tpls

  module
