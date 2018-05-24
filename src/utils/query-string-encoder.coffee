Qs                = require('qs');

keywords =
  true: true
  false: false
  null: null
  undefined: undefined

decoder = (value) ->
  return parseFloat(value) if (/^(\d+|\d*\.\d+)$/.test(value))
  return keywords[value] if (value of keywords)
  return value


module.exports =
  encode : (data)->
    Qs.stringify(data)
  decode : (search)->
    return Qs.parse(
      window.location.search.slice(1),
      decoder: decoder
    ) unless search
    Qs.parse(search)
