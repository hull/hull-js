(->
  evtPool = {}
  Hull.on = (evt, fn)->
    evtPool[evt] ?= []
    evtPool[evt].push fn

  define ['aura/aura', 'lib/hullbase', 'underscore'], (Aura, HullDef, _) ->
    hull = null

    myApp = ()->
      name: 'Hull'
      initialize: (app)->
        app.core.mediator.setMaxListeners(100)

      afterAppStart: (app)->
        sb = app.createSandbox();
        _.extend(HullDef, sb);
        for evt, cbArray of evtPool
          _.each cbArray, (cb)->
            app.core.mediator.on evt, cb
        if !app.config.debug
          props = ['widget', 'templates', 'emit', 'on', 'version', 'track', 'login', 'logout', 'data']
          props.concat(app.config.expose || [])
          _h = {}
          _.map props, (k)->
            _h[k] = window.Hull[k]
          window.Hull = _h

    if window.opener && window.opener.Hull
      try
        window.opener.Hull.emit("hull.authComplete")
        return window.close()
      catch e
        console.warn("Error: " + e)

    (config, cb, errcb) ->
      return hull if hull && hull.app
      hull = { config }
      config.namespace = "hull"
      hull.app = Aura(config)
      initProcess = hull.app
          .use(myApp())
          .use('aura-extensions/aura-handlebars') #TODO Can probably be removed. See the file for details.
          .use('aura-extensions/aura-backbone')
          .use('aura-extensions/hull-utils')
          .use('lib/client/handlebars-helpers')
          .use('lib/client/helpers')
          .use('lib/client/entity')
          .use('lib/client/api')
          .use('lib/client/auth')
          .use('lib/client/templates')
          .use('lib/client/widget')
          .start({ widgets: 'body' })

      initProcess.fail (err)->
        errcb(err) if errcb
        hull.app.stop()
        delete hull.app
        throw err if !errcb

      initProcess.done ()->
        hull.app.sandbox.emit('hull.started')
        cb(window.Hull) if cb

      return hull
)()
