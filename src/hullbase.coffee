Hull = window.Hull = window.Hull || {}

Hull.templates  ?= {}
Hull.init       = (config)->
  require ['lib/hull'], (app)->
    app(config)

Hull.widget     = (widgetName, widgetDef)->
  widgetDef = widgetDef() if Object.prototype.toString.apply(widgetDef) == '[object Function]'
  widgetDef.type      ?= "Hull"
  widgetDef.templates ?= [widgetName]
  define("__widget__$#{widgetName}@default", widgetDef)
  return widgetDef

define ['lib/version', 'underscore'], (version, _) ->
  window.Hull.version ||= version
  window.Hull

