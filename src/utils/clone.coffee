module.exports = (obj)->
  return obj unless obj?
  JSON.parse(JSON.stringify(obj))
