define ['underscore'], (_)->
  buildPayload = (name, operation, value)->
    { name: name, operation: operation, value: value }

  class Trait
    constructor: (@api, @name, @value)->
      @api ||= ->
      @set(@value) unless _.isUndefined(@value)

    inc: (step = 1)->
      @api('me/traits', 'put', buildPayload(@name, 'inc', step) )

    dec: (step = 1)->
      @api('me/traits', 'put', buildPayload(@name, 'dec', step) )

    set: (value)->
      @api('me/traits', 'put', buildPayload(@name, 'set', step) )

  config =
    api: null
  setup: (transport)->
    config.api = transport
    build: (name, value)->
      new Trait(config.api, name, value)
    many: (traits)->
      transport('me/traits', 'put', value: traits)

