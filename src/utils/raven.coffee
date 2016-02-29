script = require "./script-loader"
_ = require './lodash'
pending = []
userContext = {}

module.exports =
  init: (dsn, context)->
    if dsn && !window.Raven
      script(src: 'https://cdn.ravenjs.com/2.1.1/raven.min.js').then ->
        window.Raven.config(dsn, {
          release: REVISION
        }).install()
        window.Raven.setExtraContext(context)
        window.Raven.setUserContext(userContext)
        _.map pending.splice(0), (e)->
          window.Raven.captureException(e.err, e.ctx)

  setUserContext: (ctx)->
    if window.Raven && window.Raven.setUserContext
      window.Raven.setUserContext(ctx)
    else
      userContext = ctx

  captureException: (err, ctx)->
    if window.Raven && window.Raven.captureException
      window.Raven.captureException(err, ctx)
    else
      pending.push({ err: err, ctx: ctx })
