define ['underscore', 'lib/hullbase', 'handlebars'], (_, Hull, Handlebars) ->

  appStrategies = ['hullGlobal', 'meteor', 'sprockets', 'hullDefault']
  domStrategies = ['inner', 'global']
  serverStrategies = ['require']

  #Compiles the template depending on its definition
  setupTemplate = (tplSrc, tplName) ->
    engine = module.templateEngine
    tplName = tplName.replace(/\//g,'.',)
    if (_.isFunction(tplSrc))
      compiled = engine.template tplSrc
    else
      compiled = engine.compile tplSrc
    engine.registerPartial(tplName, compiled)
    compiled

  _domTemplate = ($el)->
    if $el.length
      module.domFind($el.get(0)).text()

  strategyHandlers =
    dom:
      inner: (selector, tplName, el)->
        $el = module.domFind(selector, el)
        _domTemplate($el)
      global: (selector, tplName)->
        $el = module.domFind(selector, document)
        _domTemplate($el)
    app:
      hullGlobal: (tplName)->
        if module.global.Hull.templates[tplName]
          setupTemplate module.global.Hull.templates["#{tplName}"], tplName
      meteor: (tplName)->
        if module.global.Meteor? && module.global.Template?[tplName]?
          module.global.Template[tplName]
      sprockets: (tplName)->
        if module.global.HandlebarsTemplates? && module.global.HandlebarsTemplates?[tplName]?
          module.global.HandlebarsTemplates[tplName]
      hullDefault: (tplName)->
        if module.global.Hull.templates._default?[tplName]
          setupTemplate(module.global.Hull.templates._default[tplName],  tplName)
    server:
      require: (tplName)->


  applyDomStrategies = (tplName, el)->
    selector = "script[data-hull-template='#{tplName}']"
    for stratName in domStrategies
      handler = strategyHandlers.dom[stratName]
      tpl = handler selector, tplName, el
      return setupTemplate(tpl, tplName) if tpl

  applyAppStrategies = (tplName)->
    for stratName in appStrategies
      handler = strategyHandlers.app[stratName]
      tpl = handler tplName
      return tpl if tpl

  applyServerStrategies = (tplName)->
    for stratName in appStrategies
      handler = strategyHandlers.server[stratName]
      tpl = handler tplName
      return tpl if tpl

  applyServerStrategies = (tplName, el)->
    # module.require(_.map(undefinedTemplates, (p) -> p[1]), ->
    #   res = Array.prototype.slice.call(arguments)
    #   for t,i in res
    #     name = undefinedTemplates[i][0]
    #     tplName = [componentName, name].join("/")
    #     ret[name] = setupTemplate(t, tplName)
    #   dfd.resolve(ret)
    # , (err)->
    #   console.error("Error loading templates", undefinedTemplates, err)
    #   dfd.reject(err))

  lookupTemplate = (componentName, el, ref, format, name)->
    path = "#{ref}/#{name}"
    tplName = [componentName, name.replace(/^_/, '')].join("/")

    tpl = applyDomStrategies tplName, el if module.domFind
    tpl = applyAppStrategies tplName unless tpl

    module.define path, tpl
    tpl

    # tpl = serverStrategies tplName, path, format unless tpl

    # tpl

  module =
    global: window
    require: require
    define: define
    templateEngine: Handlebars
    domFind: undefined
    initialize: (app) ->
      module.domFind = app.core.dom?.find
      app.core.template.load = (names=[], ref, el, format="hbs") ->
        undefinedTemplates = []
        names = [names] if _.isString(names)
        dfd   = app.core.data.deferred()
        ret = {}
        componentName = ref.replace('__component__$', '').split('@')[0]
        tpls = _.map names, _.bind(lookupTemplate, undefined, componentName, el, ref, format)
        ret = _.object names, tpls
        if undefinedTemplates.length > 0
        else
          dfd.resolve(ret)
        dfd.promise()
  module
