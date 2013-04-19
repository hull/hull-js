define ['lib/hullbase', 'handlebars'], (Hull, Handlebars) ->

  initialize: (app) ->
    setupTemplate = (tplSrc, tplName) ->
      compiled = app.core.template.hbs(tplSrc)
      Handlebars.registerPartial(tplName, compiled)
      compiled

    app.core.template.load = (names, ref, format="hbs") ->
      loadedTemplates = {}
      names = [names] if _.isString(names)
      names ?= []
      paths = []
      dfd   = app.core.data.deferred()
      ret = {}
      widgetName = ref.replace('__widget__$', '').split('@')[0]
      for name in names
        path = "#{ref}/#{name}"
        tplName = [widgetName, name.replace(/^_/, '')].join("/")
        localTpl = app.core.dom.find("script[data-hull-template='#{tplName}']")
        if localTpl.length
          parsed = setupTemplate(localTpl.text(), tplName)
          ret[name] = parsed
          define path, parsed
        else if Hull.templates[tplName]
          parsed = setupTemplate(Hull.templates["#{tplName}"],  tplName)
          ret[name] = parsed
          define path, parsed
        # Meteor
        else if window.Meteor? && window.Template?[tplName]?
          parsed = Template[tplName]
          ret[name] = parsed
          define path, parsed
        # Sprockets
        else if window.HandlebarsTemplates? && window.HandlebarsTemplates?[tplName]?
          parsed = HandlebarsTemplates[tplName]
          ret[name] = parsed
          define path, parsed
        else if Hull.templates._default?[tplName]
          parsed = setupTemplate(Hull.templates._default[tplName],  tplName)
          ret[name] = parsed
          define path, parsed
        else
          paths.push([name, "text!#{path}.#{format}"])
      if paths.length > 0
        requirePaths = _.map(paths, (p) -> p[1])
        require(requirePaths, ->
          res = Array.prototype.slice.call(arguments)
          for t,i in res
            name = paths[i][0]
            tplName = [widgetName, name].join("/")
            ret[name] = setupTemplate(t, tplName)
          dfd.resolve(ret)
        , (err)->
          console.error("Error loading templates", paths, err)
          dfd.reject(err))
      else
        dfd.resolve(ret)
      dfd.promise()

