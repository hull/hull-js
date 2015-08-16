Qs                = require('qs');

module.exports = 
  encode : (data)->
    Qs.stringify(data)
  decode : ()->
    Qs.parse(window.location.search.slice(1))
