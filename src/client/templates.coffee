define ['underscore', 'lib/hullbase', 'handlebars'], (_, Hull, Handlebars) ->

  strategies =
    app: ['hullGlobal', 'meteor', 'sprockets', 'hullDefault']
    dom: ['inner', 'global']
    server: ['require']

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

  _execute = (type, args...)->
    for stratName in strategies[type]
      strategyResult = strategyHandlers[type][stratName](args...)
      return strategyResult if strategyResult

  applyDomStrategies = (tplName, el)->
    selector = "script[data-hull-template='#{tplName}']"
    tpl = _execute('dom', selector, tplName, el)
    setupTemplate(tpl, tplName) if tpl

  applyAppStrategies = (tplName)->
    _execute('app', tplName)

  applyServerStrategies = (tplName, path, format)->
    _execute('server', tplName, path, format)


  lookupTemplate = (options, name)->
    path = "#{options.ref}/#{name}"
    tplName = [options.componentName, name.replace(/^_/, '')].join("/")

    tpl = applyDomStrategies tplName, options.rootEl if module.domFind
    tpl = applyAppStrategies tplName unless tpl

    module.define path, tpl if tpl

    tpl = applyServerStrategies tplName, path, options.templateFormat unless tpl
    tpl

  module =
    global: window
    require: require
    define: define
    templateEngine: Handlebars
    domFind: undefined
    deferred: undefined
    initialize: (app) ->
      module.domFind = app.core.dom.find
      module.deferred = app.core.data.deferred
      app.core.template.load = (names=[], ref, el, format="hbs") ->
        dfd = app.core.data.deferred()
        names = [names] if _.isString(names)
        componentProps =
          componentName: ref.replace('__component__$', '').split('@')[0]
          templateFormat: format
          rootEl: el
          ref: ref

        tpls = _.map names, _.bind(lookupTemplate, undefined, componentProps)
        app.core.data.when(tpls...).then ->
          dfd.resolve _.object(names, [].slice.apply(arguments))
        , (err)->
          dfd.reject err
        dfd.promise()
  module
