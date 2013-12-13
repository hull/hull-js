# _chk = (n,d)->
#   unless d
#     _msg = "#{n} is not defined. It is required to run hull.js"
#     alert(_msg)
#     throw new Error(_msg)
#     true

# _chk('jQuery', window.jQuery)

define ['underscore', 'lib/utils/promises', 'aura/aura', 'lib/hull.api', 'lib/utils/emitter'], (_, promises, Aura, HullAPI, emitterInstance) ->


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
      # window.Hull.parse = (el, options={})->
      #   app.core.appSandbox.start(el, options)


  initFailure: ()->

  # Hull =
  #   init: (config, cb, errcb) ->
  #     return Hull if Hull && Hull.app
  #     config.namespace = 'hull'
  #     config.debug = config.debug && { enable: true }

  #     Hull =
  #       config: config
  #       app: new Aura(config)

  #     HullAPI.init(config, initSuccess, initFailure)

  #     Hull

  # Hull












  _component = (componentName, componentDef)->
    unless componentDef
      componentDef = componentName
      componentName = null
    #Validates the name
    if componentName and not Object.prototype.toString.apply(componentName) == '[object String]'
      throw 'The component identifier must be a String'

    #Fetch the definition
    componentDef = componentDef() if Object.prototype.toString.apply(componentDef) == '[object Function]'
    throw "A component must have a definition" unless Object.prototype.toString.apply(componentDef) == '[object Object]'

    componentDef.type ?= "Hull"

    _normalizeComponentName = (name)->
      [name, source] = name.split('@')
      source ?= 'default'
      "__component__$#{name}@#{source}"

    Hull.define = define
    detectModuleName = (module)->
      if componentName
        throw "Mismatch in the names of the module" if _normalizeComponentName(componentName) != module.id
      Hull.define(module.id, componentDef)
      componentDef

    if componentName
      Hull.define _normalizeComponentName(componentName), componentDef
    else
      Hull.define ['module'], detectModuleName
    return componentDef





  setupApp = (app, api)->
    deferred = promises.deferred()
    initProcess = app
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
      .start({ components: 'body' })

    initProcess.fail (err)->
      app.stop()
      deferred.reject err

    initProcess.done ()->
      deferred.resolve app
    deferred.promise

  condition: (config)->
    app = new Aura(_.extend config, mediatorInstance: emitterInstance )
    appPromise = HullAPI.condition(config).then (hullApi)->
      return setupApp(app, hullApi)
    appPromise
  success: (auraApp)->
    booted = HullAPI.success(auraApp.core.data.hullApi)
    booted.component = _component
    booted
  failure: (error)->
    debugger


# Hull.define(i.toLowerCase(), (i) -> root[i]) if _chk(i, root[i]) && root.hasOwnProperty(i) for i in root

# main.call(root)
