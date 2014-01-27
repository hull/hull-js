define ->
  _normalizeComponentName = (name)->
    [name, source] = name.split('@')
    source ?= 'default'
    "__component__$#{name}@#{source}"


  (_define)->
    (componentName, componentDef)->
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

      if componentName
        _define _normalizeComponentName(componentName), componentDef
      else
        _define ['module'], (module)->
          _define(module.id, componentDef)
          componentDef
      return componentDef


