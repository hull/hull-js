Qs                = require('qs');

module.exports = 
  encode : (data)->
    Qs.stringify(data)
