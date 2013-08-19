define ['underscore', 'lib/hullbase', 'handlebars'], (_, Hull, Handlebars) ->

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

  # Handles the various priorities and locations of templates
  _getTemplateDefinition = (name, ref, componentName, dom)->
    path = "#{ref}/#{name}"
    tplName = [componentName, name.replace(/^_/, '')].join("/")
    localTpl = dom("script[data-hull-template='#{tplName}']")
    if localTpl.length
      parsed = setupTemplate(localTpl.text(), tplName)
    else if module.global.Hull.templates[tplName]
      parsed = setupTemplate(module.global.Hull.templates["#{tplName}"],  tplName)
    # Meteor
    else if module.global.Meteor? && module.global.Template?[tplName]?
      parsed = module.global.Template[tplName]
    # Sprockets
    else if module.global.HandlebarsTemplates? && module.global.HandlebarsTemplates?[tplName]?
      parsed = module.global.HandlebarsTemplates[tplName]
    else if module.global.Hull.templates._default?[tplName]
      parsed = setupTemplate(module.global.Hull.templates._default[tplName],  tplName)
    else
      return
    module.define path, parsed
    parsed

  module =
    global: window
    require: require
    define: define
    templateEngine: Handlebars
    getTemplateDefinition: _getTemplateDefinition
    initialize: (app) ->
      app.core.template.load = (names=[], ref, format="hbs") ->
        undefinedTemplates = []
        names = [names] if _.isString(names)
        dfd   = app.core.data.deferred()
        ret = {}
        componentName = ref.replace('__component__$', '').split('@')[0]
        for name in names
          tplDef = _getTemplateDefinition name, ref, componentName, app.core.dom.find
          if tplDef
            ret[name] = tplDef
          else
            undefinedTemplates.push([name, "text!#{ref}/#{name}.#{format}"])
        if undefinedTemplates.length > 0
          module.require(_.map(undefinedTemplates, (p) -> p[1]), ->
            res = Array.prototype.slice.call(arguments)
            for t,i in res
              name = undefinedTemplates[i][0]
              tplName = [componentName, name].join("/")
              ret[name] = setupTemplate(t, tplName)
            dfd.resolve(ret)
          , (err)->
            console.error("Error loading templates", undefinedTemplates, err)
            dfd.reject(err))
        else
          dfd.resolve(ret)
        dfd.promise()
  module
