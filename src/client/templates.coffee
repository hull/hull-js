define ->
  init: (env)->
    setupTemplate = (tplSrc, name) ->
      HandleBars = require('handlebars');
      compiled = env.core.template.hbs(tplSrc)
      HandleBars.registerPartial(name, compiled)
      compiled

    env.core.template.load = (names, ref, format="hbs")->
      loadedTemplates = {}
      names = [names] if _.isString(names)
      paths = []
      dfd   = env.core.data.deferred()
      ret = {}
      for name in names
        path = "#{ref}/#{name}"
        # if require.defined(path)
        #   ret[tpl] = require(path)
        # else
        localTpl = env.core.dom.find("script[data-hull-template='#{path}']")
        if localTpl.length
          parsed = setupTemplate(localTpl.text(), name);
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
        , dfd.reject)
      else
        dfd.resolve(ret)
      dfd.promise() 
   
