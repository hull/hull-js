throw 'jQuery must be available for components to work' unless window.jQuery

define ['underscore', 'lib/utils/promises', 'aura/aura', 'lib/utils/handlebars', 'lib/hull.api', 'lib/utils/emitter', 'lib/client/component/registrar', 'lib/helpers/login'], (_, promises, Aura, Handlebars, HullAPI, emitterInstance, componentRegistrar, loginHelpers) ->

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

  setupApp = (app, api)->
    app
      .use(hullApiMiddleware(api))
      .use('aura-extensions/aura-base64')
      .use('aura-extensions/aura-cookies')
      .use('aura-extensions/aura-backbone')
      .use('aura-extensions/aura-moment')
      .use('aura-extensions/aura-twitter-text')
      .use('aura-extensions/hull-reporting')
      .use('aura-extensions/hull-entities')
      .use('aura-extensions/hull-utils')
      .use('aura-extensions/aura-form-serialize')
      .use('aura-extensions/aura-component-validate-options')
      .use('aura-extensions/aura-component-require')
      .use('aura-extensions/hull-component-normalize-id')
      .use('aura-extensions/hull-component-reporting')
      .use('lib/client/component/api')
      .use('lib/client/component/actions')
      .use('lib/client/component/component')
      .use('lib/client/component/templates')
      .use('lib/client/component/datasource')

  init: (config)->
    appPromise = HullAPI.init(config)
    return appPromise if config.apiOnly is true
    appPromise.then (successResult)->
      app = new Aura(_.extend config, mediatorInstance: successResult.eventEmitter)
      deps =
        api: successResult.raw.api
        authScope: successResult.raw.authScope
        remoteConfig: successResult.raw.remoteConfig
        login: successResult.api.login
        logout: successResult.api.logout
      app: setupApp(app, deps)
      api: successResult
      components: true
  success: (appParts)->
    apiParts = HullAPI.success(appParts.api)
    booted = apiParts.exports
    return booted unless appParts.components
    booted.component = componentRegistrar(define)
    booted.util.Handlebars = Handlebars
    booted.define = define
    booted.parse = (el, options={})->
      appParts.app.core.appSandbox.start(el, options)
    appParts.app.start({ components: 'body' }).then ->
      #TODO populate the models from the remoteConfig
      booted.on 'hull.auth.login', _.bind(loginHelpers.login, undefined,  appParts.app.sandbox.data.api.model, appParts.app.core.mediator)
      booted.on 'hull.user.update', _.bind(loginHelpers.update, undefined,  appParts.app.sandbox.data.api.model, appParts.app.core.mediator)
      booted.on 'hull.auth.logout', _.bind(loginHelpers.logout, undefined, appParts.app.sandbox.data.api.model, appParts.app.core.mediator)
    ,(e)->
      console.error('Unable to start Aura app:', e)
      appParts.app.stop()
    exports: booted
    context: apiParts.context
  failure: (error)->
    console.error(error.message || error)
    error
