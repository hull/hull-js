define ->
  init: (env)->
    setupTemplate = (tplSrc, name) ->
      compiled = env.core.template.hbs(tplSrc)
      Handlebars.registerPartial(name, compiled)
      compiled

    env.core.template.load = (names, ref, format="hbs")->
      loadedTemplates = {}
      names = [names] if _.isString(names)
      paths = []
      dfd   = env.core.data.deferred()
      ret = {}
      widgetName = ref.replace('__widget__$', '').split('@')[0]
      for name in names
        path = "#{ref}/#{name}"
        # if require.defined(path)
        #   ret[tpl] = require(path)
        # else
        tplName = [widgetName, name].join("/")
        localTpl = env.core.dom.find("script[data-hull-template='#{tplName}']")
        if localTpl.length
          parsed = setupTemplate(localTpl.text(), name)
          ret[name] = parsed
          define path, parsed
        else if window.Hull.templates["#{tplName}"]
          parsed = setupTemplate(window.Hull.templates["#{tplName}"], name)
          ret[name] = parsed
          define path, parsed
        else if window.Hull.templates._default?["#{tplName}"]
          parsed = setupTemplate(window.Hull.templates._default["#{tplName}"], name)
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
            ret[name] = setupTemplate(t, name)
          dfd.resolve(ret)
        , (err)->
          console.error("Error loading templates", paths, err)
          dfd.reject(err))
      else
        dfd.resolve(ret)
      dfd.promise() 
   
