module.exports = (api) ->
  (traits) -> api.message('me/traits', 'put', traits)

