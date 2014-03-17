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
      userUpdate = (str)->
        handler = core.routeHandlers.hull
        if str == 'login'
          handler { path: 'me/credentials', method: 'get' }, (res)-> 
            app.config.data.credentials = res.response
          , (err)->
            console.error(err)
        else if str == 'login'
          app.config.data.credentials = {}
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
        rpc = new easyXDM.Rpc({
          acl: app.config.appDomains
        }, {
          remote: { message: {}, ready: {} }
          local:  { message: onRemoteMessage, userUpdate: userUpdate }
        })
      catch e
        rpcFall = new easyXDM.Rpc({},
          remote: {message: {}}
        )
        rpcFall.message error: "#{e.message}, please make sure this domain is whitelisted for this app."

      true

    afterAppStart: -> rpc.ready(app.config)
