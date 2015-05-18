xdm                 = require 'xdm.js'
catchAll = (res)-> res

class Channel
  constructor: (config, services)->
    @_ready = {}
    @promise = new Promise (resolve, reject)=>
      @_ready.resolve = resolve
      @_ready.reject = reject

    @rpc = null;


    try
      local = services.getMethods()
      @rpc = new xdm.Rpc
        acl: config.appDomains
      ,
        remote:
          ready           : {}
          message         : {}
          userUpdate      : {}
          settingsUpdate  : {}
          getClientConfig : {}
          track           : {}
          show            : {}
          hide            : {}
        local: local

      # Send config to client
      @rpc.ready(config)
      @rpc.getClientConfig(@_ready.resolve)

    catch e
      try
        whitelisted = config.appDomains.join('\n').replace(/\(\:\[0-9\]\+\)\?\$/g,'').replace(/\^\(https\?\:\/\/\)\?/g,'').replace(/\\/g,'')
        e = new Error("#{e.message}, You should whitelist this domain. The following domains are authorized : \n#{whitelisted}");
        @_ready.reject(e)
        @rpc = new xdm.Rpc({}, remote: { loadError: {} })
        @rpc.loadError e
      catch e
        throw new Error("Unable to establish communication between Hull Remote and your page. #{e.message}")

module.exports = Channel
