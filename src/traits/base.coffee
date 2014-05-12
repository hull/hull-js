define ['underscore'], (_)->
  class Trait
    constructor: (@api, @name, @value)->
      @api ||= ->
      @set(@value) unless _.isUndefined(@value)

    inc: (step = 1)->
      @api('me/traits', 'put', { name: @name, operation: 'inc', value: step } )

    dec: (step = 1)->
      @api('me/traits', 'put', { name: @name, operation: 'dec', value: step } )

    set: (value)->
      @api('me/traits', 'put', { name: @name, operation: 'set', value: value } )

  config =
    api: null
  setup: (transport)->
    config.api = transport
    build: (name, value)->
      new Trait(config.api, name, value)

