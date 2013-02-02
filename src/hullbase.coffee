define ['lib/version', 'underscore'], (version, _)->
  window.Hull = Hull = _.extend({
    version: version,
    templates: {}
    widget: (widgetName, widgetDef)->
      widgetDef.type ?= "Hull"
      define("__widget__$#{widgetName}@default", widgetDef)
      return widgetDef
  }, window.Hull || {});
  Hull
