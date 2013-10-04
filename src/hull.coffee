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
      for evt, cbArray of evtPool
        _.each cbArray, (cb)->
          app.core.mediator.on evt, cb
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
        .use('aura-extensions/aura-handlebars') #TODO Can probably be removed. See the file for details.
        .use('aura-extensions/aura-backbone')
        .use('aura-extensions/aura-moment')
        .use('aura-extensions/aura-twitter-text')
        .use('aura-extensions/hull-utils')
        .use('aura-extensions/component-normalize-id')
        .use('aura-extensions/component-validate-options')
        .use('aura-extensions/component-require')
        .use('lib/client/handlebars-helpers')
        .use('lib/client/helpers')
        .use('lib/client/entity')
        .use('lib/client/api')
        .use('lib/client/templates')
        .use('lib/client/component')
        .use('lib/api/features')
        .use (app)->
          afterAppStart: (app)->
            window.Hull.parse = (el, options={})->
              app.core.appSandbox.start(el, options)
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
