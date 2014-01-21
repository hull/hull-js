define ['underscore', 'xdm'], (_, xdm)->

  catchAll = (res)->
    console.warn("CatchAll Handler: ", res)
    res

  (app)->
    rpc = null
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

      try
        rpc = new xdm.Rpc({
          acl: app.config.appDomains
        }, {
          remote: { message: {}, ready: {}, userUpdate: {} }
          local:  { message: onRemoteMessage }
        })
      catch e
        rpcFall = new xdm.Rpc({},
          remote: {message: {}}
        )
        rpcFall.message error: "#{e.message}, please make sure this domain is whitelisted for this app."

      true

    afterAppStart: (app)->
      rpc.ready(app.config)
      app.sandbox.on 'hull.user.update', rpc.userUpdate.bind(rpc)
