RemoteConfigStore = require '../../flux/stores/RemoteConfigStore'
getWrappedRequest = require '../wrapped-request'
jsonp             = require 'browser-jsonp'

class GenericService
  name : null
  path : null
  constructor : (config,gateway)->
    @config  = config
    @gateway = gateway
    @wrappedRequest = getWrappedRequest({name:@name,path:@path},gateway)

  getSettings: (provider)-> RemoteConfigStore.getAuth(@name||provider)
  getHullToken: ()-> RemoteConfigStore.getToken()

  request_jsonp : (request)=> jsonp(request)

module.exports = GenericService
