# _chk = (n,d)->
#   unless d
#     _msg = "#{n} is not defined. It is required to run hull.js"
#     alert(_msg)
#     throw new Error(_msg)
#     true

# _chk('jQuery', window.jQuery)

Hull = {
  on: ()->
  track: ()->
  init: (config, cb, errb)->
}

define ['aura/aura', './hull.api'], (Aura, HullAPI) ->


  hullApiMiddleware = (app)->
    name: 'Hull'

    initialize: (app)->
      app.core.mediator.setMaxListeners(100)
      app.core.data.hullApi = HullAPI.data.api

    afterAppStart: (app)->
      _ = app.core.util._
      sb = app.sandboxes.create();

      # _.extend(HullDef, sb);
      # After app init, call the queued events
      for evt, cbArray of evtPool
        _.each cbArray, (cb)-> app.core.mediator.on evt, cb

  hullInitMiddleware = (app)->

    initialize: (app) ->

    afterAppStart: (app) ->
      # window.Hull.parse = (el, options={})->
      #   app.core.appSandbox.start(el, options)

  initSuccess=(hullApi)->
    initProcess = hull.app
        .use(hullApiMiddleware())
        .use('aura-extensions/aura-base64')
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
        # .use('lib/client/component/api')
        # .use('lib/client/component/component')
        # .use('lib/client/component/hull-handlebars-helpers')
        # .use('lib/client/component/templates')
        .use(hullInitMiddleware())
        .start({ components: 'body' })

    initProcess.fail (err)->
      errcb(err) if errcb
      hull.app.stop()
      delete hull.app
      throw err if !errcb

    initProcess.done ()->
      hull.app.sandbox.emit('hull.init')
      cb(window.Hull) if cb

  initFailure: ()->

  Hull = 
    on: ()->
    track: ()->
    init: (config, cb, errcb) ->
      return Hull if Hull && Hull.app
      config.namespace = 'hull'
      config.debug = config.debug && { enable: true }

      Hull =
        config: config
        app: new Aura(config)

      HullAPI.init(config, initSuccess, initFailure)

      Hull

  Hull

# Hull.define(i.toLowerCase(), (i) -> root[i]) if _chk(i, root[i]) && root.hasOwnProperty(i) for i in root

# main.call(root)
