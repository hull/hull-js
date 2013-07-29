# TODO: Need answers to these questions
# * Why should we consider a previously defined window.Hull ?
# * Having templates defined before hull.js is loaded is pointless at best, complete developer madness at worst
# * Setting the version conditionnally is dangerous as this hull.js is loaded at version x0.y0.z0
#     whereas hull-remote.js will be loaded with a __potentially__ incompatible version x1.y1.z1

Hull = window.Hull = window.Hull || {}

Hull.templates  ?= {}
Hull.init       = (config, cb, errcb)->
  require ['lib/hull'], (app)->
    app(config, cb, errcb)

Hull.widget     = (widgetName, widgetDef)->
  #Validates the name
  throw 'A widget must have a identifier' unless widgetName
  throw 'The widget identifier must be a String' unless Object.prototype.toString.apply(widgetName) == '[object String]'

  #Fetch the definition
  widgetDef = widgetDef() if Object.prototype.toString.apply(widgetDef) == '[object Function]'
  throw "The widget #{widgetName} must have a definition" unless Object.prototype.toString.apply(widgetDef) == '[object Object]'

  widgetDef.type ?= "Hull"
  define("__component__$#{widgetName}@default", widgetDef)
  return widgetDef

define ['lib/utils/version', 'underscore'], (version, _) ->
  window.Hull.version ||= version
  window.Hull

