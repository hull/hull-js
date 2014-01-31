define ['underscore', 'lib/utils/handlebars', 'lib/utils/handlebars-helpers', 'lib/utils/promises', 'lib/utils/q2jQuery', 'require'], (_, Handlebars, hbsHelpers, promises, q2jQuery, require) ->

  strategies =
    app: ['hullGlobal', 'meteor', 'sprockets', 'hullDefault']
    dom: ['inner', 'global']
    server: ['require']

  #Compiles the template depending on its definition
  setupTemplate = (tplSrc, tplName, wrapped, options) ->
    if (!_.isFunction(tplSrc))
      compiled = Handlebars.compile tplSrc
    else if !wrapped
      compiled = Handlebars.template tplSrc, options
    else
      compiled = tplSrc

    Handlebars.registerPartial(tplName, compiled)
    compiled

  _domTemplate = ($el)->
    return unless $el.length
    first = $el.get(0)
    $first = module.domFind(first)
    $first.text() || $first.html() || first.innerHTML

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
        if module.global.Hull.templates?[tplName]
          [module.global.Hull.templates["#{tplName}"], tplName, false]
      meteor: (tplName)->
        if module.global.Meteor? && module.global.Template?[tplName]?
          [module.global.Template[tplName], tplName, false]
      sprockets: (tplName)->
        if module.global.HandlebarsTemplates? && module.global.HandlebarsTemplates?[tplName]?
          [module.global.HandlebarsTemplates[tplName], tplName, true]
      hullDefault: (tplName)->
        if module.global.Hull.templates?._default?[tplName]
          [module.global.Hull.templates._default[tplName],  tplName, false]
    server:
      require: (tplName, path, format)->
        path = "text!#{path}.#{format}"
        dfd = promises.deferred()
        module.require [path], (tpl)->
          dfd.resolve [tpl, tplName, false]
        , (err)->
          console.error "Error loading template", tplName, err.message
          dfd.reject err
        dfd.promise

  _execute = (type, args...)->
    for stratName in strategies[type]
      strategyResult = strategyHandlers[type][stratName](args...)
      return strategyResult if strategyResult

  applyDomStrategies = (tplName, el)->
    selector = "script[data-hull-template='#{tplName}']"
    tpl = _execute('dom', selector, tplName, el)
    [tpl, tplName, false] if tpl

  applyAppStrategies = (tplName)->
    _execute('app', tplName)

  applyServerStrategies = (tplName, path, format)->
    _execute('server', tplName, path, format)


  lookupTemplate = (options, name)->
    path = "#{options.ref}/#{name}"
    tplName = [options.componentName, name.replace(/^_/, '')].join("/")

    params = applyDomStrategies tplName, options.rootEl if module.domFind
    params = applyAppStrategies tplName unless params

    if params
      tpl = setupTemplate(params...)
      module.define path, tpl
    else
      tpl = applyServerStrategies(tplName, path, options.templateFormat).then (params)->
        setupTemplate(params...)
    tpl

  module =
    global: window
    define: define
    require: require
    domFind: undefined
    load: (names=[], ref, el, format="hbs") ->
      dfd = promises.deferred()
      names = [names] if _.isString(names)
      componentProps =
        componentName: ref.replace('__component__$', '').split('@')[0]
        templateFormat: format
        rootEl: el
        ref: ref

      tpls = _.map names, _.bind(lookupTemplate, undefined, componentProps)
      promises.all(tpls).then (ary)->
        dfd.resolve _.object(names, ary)
      , (err)->
        console.warn('WARNING', err)
        dfd.reject err
      dfd.promise
    initialize: (app) ->
      Handlebars.registerHelper(k, v) for k,v of hbsHelpers(app)
      module.domFind = app.core.dom.find
      app.components.before 'initialize', ->
        promise = module.load(@templates, @ref, @el).then (tpls)=>
          @_templates = tpls
        , (err)->
          console.error('Error while loading templates:', err)
          throw err
        #FIXME OMG!!
        q2jQuery(promise)
      null
  module
