xdm                 = require 'xdm.js'
promises            = require '../utils/promises'

RemoteConfigActions = require '../flux/actions/RemoteConfigActions'
RemoteUserActions   = require '../flux/actions/RemoteUserActions'

catchAll = (res)-> res

class Channel
  constructor :(config, services)->
    dfd = promises.deferred()
    @rpc = null;
    @promise = dfd.promise


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
      @rpc.getClientConfig(dfd.resolve)
    catch e
      dfd.reject(e)
      throw 'Unable to establish communication between Hull Remote and your page.' unless channel.rpc
      @rpc = new xdm.Rpc({}, remote: {message: {}});
      @rpc.message error: "#{e.message}, please make sure this domain is whitelisted for this app."

module.exports = Channel
