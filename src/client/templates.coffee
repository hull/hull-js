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
    module.domFind($el.get(0)).text() if $el.length

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
      require: (tplName, path, format)->
        path = "text!#{path}.#{format}"
        dfd = module.deferred()
        module.require [path], (tpl)->
          dfd.resolve setupTemplate(tpl, tplName) 
        , (err)->
          console.error "Error loading template", tplName, err.message 
          dfd.reject err 
        dfd

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

  applyServerStrategies = (tplName, path, format)->
    for stratName in serverStrategies
      handler = strategyHandlers.server[stratName]
      tpl = handler tplName, path, format
      return tpl if tpl


  lookupTemplate = (componentName, el, ref, format, name)->
    path = "#{ref}/#{name}"
    tplName = [componentName, name.replace(/^_/, '')].join("/")

    tpl = applyDomStrategies tplName, el if module.domFind
    tpl = applyAppStrategies tplName unless tpl

    module.define path, tpl if tpl

    tpl = applyServerStrategies tplName, path, format unless tpl
    tpl

  module =
    global: window
    require: require
    define: define
    templateEngine: Handlebars
    domFind: undefined
    initialize: (app) ->
      module.domFind = app.core.dom.find
      module.deferred = app.core.data.deferred
      app.core.template.load = (names=[], ref, el, format="hbs") ->
        names = [names] if _.isString(names)
        componentName = ref.replace('__component__$', '').split('@')[0]
        dfd   = app.core.data.deferred()
        tpls = _.map names, _.bind(lookupTemplate, undefined, componentName, el, ref, format)
        app.core.data.when.apply(undefined, tpls).then ->
          dfd.resolve _.object names, [].slice.apply(arguments)
        , (err)->
          dfd.reject(err)
        dfd.promise()
  module
