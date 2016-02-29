Raven = require 'raven-js'

module.exports =
  init: (dsn, context)->
    console.warn('initRaven', dsn, context)
    if dsn
      Raven.config(dsn).install()
      Raven.setExtraContext(context)

  captureException: (err, ctx)->
    console.warn('Raven capture exception !', err, ctx)
    Raven.captureException(err, ctx) if Raven.isSetup()
