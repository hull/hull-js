evtPool = {}
Hull.on = (evt, fn)->
  evtPool[evt] ?= []
  evtPool[evt].push fn

define ['aura/aura', 'lib/hullbase', 'underscore'], (Aura, HullDef, _) ->
  myApp = ()->
    name: 'Hull'
    initialize: (app)->
      app.core.mediator.setMaxListeners(100)

    afterAppStart: (app)->
      sb = app.sandboxes.create();

      _.extend(HullDef, sb);
      # After app init, call the queued events
      for evt, cbArray of evtPool
        _.each cbArray, (cb)-> app.core.mediator.on evt, cb

      # In production mode, only expose select properties on the Hull object
      if !app.config.debug
        props = ['component', 'templates', 'emit', 'on', 'version', 'track', 'login', 'logout', 'data']
        props.concat(app.config.expose || [])
        _h = {}
        _.map props, (k)->
          _h[k] = window.Hull[k]
        window.Hull = _h

  hull = null
  (config, cb, errcb) ->
    return hull if hull && hull.app

    config.namespace = 'hull'
    config.debug = config.debug && { enable: true }

    hull =
      config: config
      app: new Aura(config)

    initProcess = hull.app
        .use(myApp())
        .use('aura-extensions/aura-base64')
        # .use('aura-extensions/aura-promises')
        .use('aura-extensions/aura-cookies')
        .use('aura-extensions/aura-backbone')
        .use('aura-extensions/aura-moment')
        .use('aura-extensions/aura-twitter-text')
        .use('aura-extensions/aura-handlebars') #TODO Can probably be removed. See the file for details.
        .use('aura-extensions/hull-reporting')
        .use('aura-extensions/hull-entities')
        .use('aura-extensions/hull-utils')
        .use('aura-extensions/aura-component-validate-options')
        .use('aura-extensions/aura-component-require')
        .use('aura-extensions/hull-component-normalize-id')
        .use('aura-extensions/hull-component-reporting')
        .use('lib/client/component/api')
        .use('lib/client/component/component')
        .use('lib/client/component/hull-handlebars-helpers')
        .use('lib/client/component/templates')
        .use (app)->
          afterAppStart: (app)->
            window.Hull.parse = (el, options={})->
              app.core.appSandbox.start(el, options)
              debugger
        .start({ components: 'body' })

    initProcess.fail (err)->
      errcb(err) if errcb
      hull.app.stop()
      delete hull.app
      throw err if !errcb

    initProcess.done ()->
      hull.app.sandbox.emit('hull.init')
      cb(window.Hull) if cb

    return hull
