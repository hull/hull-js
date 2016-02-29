logger  = require './logger'
Raven = require 'raven-js'
module.exports = (err)->
  Raven.captureException(err) if Raven.isSetup()
  logger.error err.message, err.stack
