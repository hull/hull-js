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
    hasConflicts = false
    for name in ['require', 'define']
      _conflicts[name] ||= window[name] if window[name]
      if config.useRequire and Hull[name] != window[name]
        hasConflicts = true
        window[name] = Hull[name]
    if hasConflicts
      console.log("Setting window.#{name} to Hull.#{name}. Use Hull.noConflict() to revert to previous values.") if window.console and config.debug
    app(config, cb, errcb)

Hull.noConflict = ->
  for name of _conflicts
    window[name] = _conflicts[name]

Hull.define = define
Hull.require = require

Hull.component = Hull.widget = (componentName, componentDef) ->
  unless componentDef
    componentDef = componentName
    componentName = null
  #Validates the name
  if componentName and not Object.prototype.toString.apply(componentName) == '[object String]'
    throw 'The component identifier must be a String'

  #Fetch the definition
  componentDef = componentDef() if Object.prototype.toString.apply(componentDef) == '[object Function]'
  throw "A component must have a definition" unless Object.prototype.toString.apply(componentDef) == '[object Object]'

  componentDef.type ?= "Hull"

  _normalizeComponentName = (name)->
    [name, source] = name.split('@')
    source ?= 'default'
    "__component__$#{name}@#{source}"

  detectModuleName = (module)->
    if componentName
      throw "Mismatch in the names of the module" if _normalizeComponentName(componentName) != module.id
    Hull.define(module.id, componentDef)
    componentDef

  if componentName
    Hull.define _normalizeComponentName(componentName), componentDef
  else
    Hull.define ['module'], detectModuleName
  return componentDef

define ['lib/utils/version', 'underscore'], (version, _) ->
  window.Hull.version ||= version
  window.Hull
