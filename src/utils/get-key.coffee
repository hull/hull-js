clone    = require './clone'
_        = require './lodash'

module.exports = (hash, key)->
  return hash unless key and _.isObject(hash)
  _.each key.split('.'), (k)->
    return hash if hash == undefined
    if _.contains(_.keys(hash), k)
      hash = hash[k]
    else
      hash = undefined

  clone(hash)
