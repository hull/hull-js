Qs                = require('qs');

module.exports = 
  encode : (data)->
    Qs.stringify(data)
  decode : (search)->
    return Qs.parse(window.location.search.slice(1)) unless search
    Qs.parse(search)
