# TODO: Need answers to these questions
# * Why should we consider a previously defined window.Hull ?
# * Having templates defined before hull.js is loaded is pointless at best, complete developer madness at worst
# * Setting the version conditionnally is dangerous as this hull.js is loaded at version x0.y0.z0
#     whereas hull-remote.js will be loaded with a __potentially__ incompatible version x1.y1.z1

Hull = window.Hull = window.Hull || {}

Hull.templates ?= {}

_conflicts = {}


Hull.init = (config, cb, errcb) ->
  require ['lib/hull'], (app) ->
    for name in ['require', 'define']
      _conflicts[name] ||= window[name] if window[name]
      window[name] = Hull[name]
    app(config, cb, errcb)

Hull.noConflict = ->
  for name of _conflicts
    window[name] = _conflicts[name]

Hull.component = Hull.widget = (componentName, componentDef) ->
  #Validates the name
  throw 'A component must have a identifier' unless componentName
  throw 'The component identifier must be a String' unless Object.prototype.toString.apply(componentName) == '[object String]'

  #Fetch the definition
  componentDef = componentDef() if Object.prototype.toString.apply(componentDef) == '[object Function]'
  throw "The component #{componentName} must have a definition" unless Object.prototype.toString.apply(componentDef) == '[object Object]'

  componentDef.type ?= "Hull"
  define("__component__$#{componentName}@default", componentDef)
  return componentDef

define ['lib/utils/version', 'underscore'], (version, _) ->
  window.Hull.version ||= version
  window.Hull
