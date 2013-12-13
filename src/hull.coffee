define ['underscore', 'lib/utils/promises', 'aura/aura', 'lib/hull.api', 'lib/utils/emitter', 'lib/client/component/registrar'], (_, promises, Aura, HullAPI, emitterInstance, componentRegistrar) ->

  hullApiMiddleware = (api)->
    name: 'Hull'
    initialize: (app)->
      app.core.mediator.setMaxListeners(100)
      app.core.data.hullApi = api
    afterAppStart: (app)->
      _ = app.core.util._
      sb = app.sandboxes.create();
      # _.extend(HullDef, sb);
      # After app init, call the queued events

  hullInitMiddleware = (app)->
    initialize: (app) ->
    afterAppStart: (app) ->
      window.Hull.parse = (el, options={})->
        app.core.appSandbox.start(el, options)

  setupApp = (app, api)->
    app
      .use(hullApiMiddleware(api))
      .use('aura-extensions/aura-base64')
      .use('aura-extensions/aura-cookies')
      .use('aura-extensions/aura-backbone')
      .use('aura-extensions/aura-moment')
      .use('aura-extensions/aura-twitter-text')
      .use('aura-extensions/aura-handlebars') #TODO Can probably be removed. See the file for details.
      .use('aura-extensions/hull-reporting')
      .use('aura-extensions/hull-entities')
      .use('aura-extensions/hull-utils')
      .use('aura-extensions/aura-form-serialize')
      .use('aura-extensions/aura-component-validate-options')
      .use('aura-extensions/aura-component-require')
      .use('aura-extensions/hull-component-normalize-id')
      .use('aura-extensions/hull-component-reporting')
      .use('lib/client/component/api')
      .use('lib/client/component/component')
      .use('lib/client/component/templates')
      .use('lib/client/component/hull-handlebars-helpers')
      .use(hullInitMiddleware())

  condition: (config)->
    app = new Aura(_.extend config, mediatorInstance: emitterInstance )
    appPromise = HullAPI.condition(config).then (hullApi)->
      app: setupApp(app, hullApi)
      api: hullApi
    appPromise
  success: (appParts)->
    booted = HullAPI.success(appParts.api)
    booted.component = componentRegistrar(define)
    booted.define = define
    appParts.app.start({ components: 'body' }).fail (e)->
      console.error('Unable to start Aura app:', e)
      appParts.app.stop()
    booted
  failure: (error)->
    debugger
