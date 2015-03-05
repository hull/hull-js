class Trait
  constructor: (api, name, value)->
    @_api = api
    @name = name
    @set(value) if value?

  inc: (step = 1)->
    @_api('me/traits', 'put', { name: @name, operation: 'inc', value: step })

  dec: (step = 1)->
    @_api('me/traits', 'put', { name: @name, operation: 'dec', value: step })

  set: (value)->
    @_api('me/traits', 'put', { name: @name, operation: 'set', value: value })

module.exports = (api)->
  (name, value)-> new Trait(api, name, value)
