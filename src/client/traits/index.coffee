module.exports = (api) ->
  (traits) -> 
    Hull.emit('hull.traits', traits)
    Hull.emit('hull.identify', traits)
    api.message('me/traits', 'put', traits)
    
