define ->
  rpc = null

  catchAll = (res)->
    console.warn("CatchAll Handler: ", res)
    res

  (env)->
    config:
      require:
        paths:
          'easyXDM':            'easyXDM/easyXDM'
          'route-recognizer' :  'route-recognizer/dist/route-recognizer.amd'
        shim:
          easyXDM: { exports: 'easyXDM' }


    init: (env)->
      core = env.core
      Router = require('route-recognizer')
      core.services = new Router

      onRemoteMessage = (req, callback, errback)->
        throw new Error("Path not recognized #{JSON.stringify(req)}") unless req.path

        routes  = core.services.recognize(req.path)

        if routes && route = routes[0]
          console.warn("[ROUTE] #{req.method.toUpperCase()}: #{req.path}", req.params)
          route.handler(req, route, callback, errback)
        else
          errback(catchAll(req))

      rpc = new easyXDM.Rpc({}, {
        remote: { message: {}, ready: {} }
        local:  { message: onRemoteMessage }
      })
      true

    afterAppStart: -> rpc.ready(env.config.data)


