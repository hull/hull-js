define ['aura/aura', 'lib/hullbase', 'underscore'], (Aura, HullDef, _) ->

  evtPool = {}
  emittedEvts = []
  HullDef.on = (evt, fn)->
    evtPool[evt] ?= []
    evtPool[evt].push fn

  HullDef.emit = (evt, data)->
    emittedEvts.push({evt: evt, data: data})

  hull = null

  myApp = ()->
    name: 'Hull'
    initialize: (app)->
      app.core.mediator.setMaxListeners(100)

    afterAppStart: (app)->
      sb = app.createSandbox();
      Hull = _.extend(HullDef, sb);
      if !app.config.debug
        props = ['widget', 'templates', 'emit', 'on', 'version', 'track']
        props.concat(config.expose || [])
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
        .use('aura-extensions/aura-handlebars')
        .use('aura-extensions/aura-backbone')
        .use('aura-extensions/hull-utils')
        .use('lib/client/handlebars-helpers')
        .use('lib/client/helpers')
        .use('lib/client/entity')
        .use('lib/client/api')
        .use('lib/client/datasource')
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
      cb(window.Hull) if cb
      for evt, cbArray in evtPool
        for cb in cbArray
          Hull.on(evt, cbArray)
      for emitted in emittedEvts
        Hull.emit(emitted.evt, emitted.data)

    return hull
