define ['underscore'], (_)->

  class Trait
    constructor: (@api, @name, @value)->
      @api ||= ->
      @set(@value) unless _.isUndefined(@value)

    inc: (step = 1)->
      @api('me/traits', 'put', { name: @name, op: "inc", value: step } )

    dec: (step = 1)->
      @api('me/traits', 'put', { name: @name, op: "dec", value: step } )

    set: (val)->
      @api('me/traits', 'put', { name: @name, op: "set", value : val } )

  config =
    api: null
  setup: (transport)->
    config.api = transport
    build: (name, value)->
      new Trait(config.api, name, value)

