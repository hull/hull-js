define ['aura/aura', 'lib/hullbase', 'underscore'], (Aura, HullDef, _) ->

  hull = null

  myApp = (cb)->
    name: 'Hull'
    initialize: (app)->
      app.core.mediator.setMaxListeners(100)
      if app.config.debug
        app.core.mediator.onAny ->
          console.log('[Hull Event]', arguments)

    afterAppStart: (app)->
      sb = app.createSandbox();
      Hull = _.extend(HullDef, sb);
      Hull.me     = sb.data.api.model('me');
      Hull.app    = sb.data.api.model('app');
      Hull.org    = sb.data.api.model('org');
      if !app.config.debug
        props = ['widget', 'templates', 'emit', 'on', 'version', 'track']
        props.concat(config.expose || [])
        _h = {}
        _.map props, (k)->
          _h[k] = window.Hull[k]
        window.Hull = _h

      cb(window.Hull) if cb

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
        .use(myApp(cb))
        .use('aura-extensions/aura-handlebars')
        .use('aura-extensions/aura-backbone')
        .use('aura-extensions/hull-utils')
        .use('lib/client/handlebars-helpers')
        .use('lib/client/helpers')
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

    return hull
