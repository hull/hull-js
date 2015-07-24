_        = require '../../utils/lodash'
assign   = require '../../polyfills/assign'

class Trait
  constructor: (api, name, value)->
    @_api = api
    @name = name
    if value?
      # If value is an object, then it has to be compatible
      if _.isObject value
        # new Trait('a_number', {value: 20, operation: 'dec'});
        @raw assign({},value,{name:@name})
      else
        # new Trait('a_number', 20);
        @set value

  inc: (step = 1)->
    @raw({ name: @name, operation: 'inc', value: step })

  dec: (step = 1)->
    @raw({ name: @name, operation: 'dec', value: step })

  set: (value)->
    @raw({ name: @name, operation: 'set', value: value })

  raw: (payload)->
    @_api.message('me/traits', 'put', payload)


module.exports = (api)->
  (name, value)->
    # We've been passed a Hash, iterate on it to create a trait for each.
    if _.isObject(name)
        # Hull.traits({
        #   'a_number'  : {value: 20, operation: 'dec'},
        #   'a_number_2': {value: 20, operation: 'dec'},
        #   'a_number_3': 20
        # });
      _.map name, (value, key)-> new Trait(api, key, value)
      Hull.emit('hull.traits',name)
    else
      # Hull.traits('a_number', {value: 20, operation: 'dec'});
      # Hull.traits('a_number', 20);
      traits = {}
      traits[name] = value
      Hull.emit('hull.traits',traits)
      new Trait(api, name, value)
