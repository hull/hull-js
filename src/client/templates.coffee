define ->
  init: (env)->
    env.core.template.load = (tplNames, ref, format="hbs")->
      loadedTemplates = {}
      names = [tplNames] if _.isString(tplNames)
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
          parsed = env.core.template.parse(localTpl.text(), name)
          ret[name] = parsed
          define path, parsed
        else
          paths.push([name, "#{format}!#{path}"])
      if paths.length > 0
        requirePaths = _.map(paths, (p) -> p[1])
        require(requirePaths, ->
          res = Array.prototype.slice.call(arguments)
          for t,i in res
            ret[paths[i][0]] = env.core.template.hbs(t)
          dfd.resolve(ret)
        , dfd.reject)
      else
        dfd.resolve(ret)
      dfd.promise() 
   
