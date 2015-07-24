logger  = require './logger'
module.exports = (err)->
  logger.error err.message, err.stack
