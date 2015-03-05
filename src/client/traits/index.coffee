_       = require '../../utils/lodash'
assign  = require 'object-assign'

class Trait
  constructor: (api, @name, @value)->
    @set(@value) unless _.isUndefined(@value)

  inc: (step = 1)->
    api('me/traits', 'put', { name: @name, operation: 'inc', value: step } )

  dec: (step = 1)->
    api('me/traits', 'put', { name: @name, operation: 'dec', value: step } )

  set: (value)->
    api('me/traits', 'put', { name: @name, operation: 'set', value: value } )

module.exports = (api)->
  (name, value)-> new Trait(api, name, value)
