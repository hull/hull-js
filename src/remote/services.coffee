define ['underscore'], (_)->
  rpc = null

  catchAll = (res)->
    console.warn("CatchAll Handler: ", res)
    res

  (app)->
    require:
      paths:
        'easyXDM': 'components/easyXDM/easyXDM'
      shim:
        easyXDM: { exports: 'easyXDM' }


    initialize: (app)->
      core = app.core
      core.routeHandlers = {}

      onRemoteMessage = (req, callback, errback)->
        throw new Error("Path not recognized #{JSON.stringify(req)}") unless req.path

        handler = core.routeHandlers[req.provider]
        if _.isFunction handler
          handler(req, callback, errback)
        else
          errback(catchAll(req))

      rpc = new easyXDM.Rpc({
        acl: app.config.appDomains
      }, {
        remote: { message: {}, ready: {} }
        local:  { message: onRemoteMessage }
      })
      true

    afterAppStart: -> rpc.ready(app.config)
