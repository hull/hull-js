define ->
  rpc = null

  catchAll = (res)->
    console.warn("CatchAll Handler: ", res)
    res

  (app)->
    require:
      paths:
        'easyXDM':            'components/easyXDM/easyXDM'
        'route-recognizer' :  'components/route-recognizer/dist/route-recognizer.amd'
      shim:
        easyXDM: { exports: 'easyXDM' }


    init: (app)->
      core = app.core
      Router = require('route-recognizer')
      core.services = new Router

      onRemoteMessage = (req, callback, errback)->
        throw new Error("Path not recognized #{JSON.stringify(req)}") unless req.path

        routes  = core.services.recognize(req.path)

        if routes && route = routes[0]
          route.handler(req, route, callback, errback)
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
