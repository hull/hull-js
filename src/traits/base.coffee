define ['underscore'], (_)->
  buildPayload = (name, operation, value)->
    { name: name, operation: operation, value: value }

  normalizeTraits = (traits)->
    _.reduce traits, (memo, v, k)->
      unless _.isObject(v)
        v =
          operation: 'set'
          value: v
      v.operation = 'set' unless v.operation
      memo[k] = v
      memo
    , {}

  setup: (transport)->
    (traits)-> transport.put('me/traits', normalizeTraits(traits))
