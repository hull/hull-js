define ['underscore', 'xdm'], (_, xdm)->
  rpc = null

  catchAll = (res)->
    console.warn("CatchAll Handler: ", res)
    res

  (app)->

    initialize: (app)->
      core = app.core
      core.routeHandlers = {}
      core.tokens = app.config.services.credentials

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
          remote: { message: {}, ready: {} }
          local:  { message: onRemoteMessage }
        })
      catch e
        rpcFall = new xdm.Rpc({},
          remote: {message: {}}
        )
        rpcFall.message error: "#{e.message}, please make sure this domain is whitelisted for this app."

      true

    afterAppStart: ->
      rpc.ready(app.config)
