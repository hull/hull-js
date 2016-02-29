logger  = require './logger'
Raven = require './raven'

module.exports = (err)->
  Raven.captureException(err)
  logger.error err.message, err.stack
