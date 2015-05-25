Promise   = require('es6-promise').Promise
cookie    = require '../utils/cookies'
EventBus  = require '../utils/eventbus'
logger    = require '../utils/logger'
parseOpts = require './parse-opts'
channel   = require './channel'

class Api
  constructor : (config, channel, currentUser)->
    @config = config
    @remoteConfig = channel.remoteConfig
    @services = @remoteConfig.settings
    @channel = channel
    @currentUser = currentUser
    EventBus.on 'hull.settings.update', (settings)-> @services = settings

    authScope = if channel.remoteConfig.data.headers?['Hull-Auth-Scope'] then channel.remoteConfig.data.headers['Hull-Auth-Scope'].split(":")[0] else ''


    @_message = (params, userSuccessCallback, userErrorCallback)=>

  ###
  # Sends the message described by @params to xdm
  # @param {Object} contains the provider, uri and parameters for the message
  # @param {Function} optional a success callback
  # @param {Function} optional an error callback
  # @return {Promise}
  ###
  message: ()=>
    return logger.error("Hull Api is not initialized yet. You should run your app from the callback of Hull.ready()") unless @channel.rpc
    {opts, callback, errback} = parseOpts(Array.prototype.slice.call(arguments))
    p = new Promise (resolve, reject)=>

      onSuccess = (res={})=>
        @updateCurrentUserCookies(res.headers, res.provider)
        callback(res.body)
        resolve(res.body)

      onError = (response, error)=>
        errback(response.message, error)
        reject(response.message, error)

      @channel.rpc.message(opts, onSuccess, onError)

  clearToken    : (args...)=>
    @channel.rpc.clearUserToken(args...) # No need to be exposed, IMO

  refreshUser   : ()=>
    new Promise (resolve, reject)=>
      onSuccess  = (res={})=>
        @currentUser.update(res)
        resolve(res)

      onError   = (err={})=>
        reject(err)

      @channel.rpc.refreshUser(onSuccess, onError)

  updateCurrentUserCookies: (headers, provider)=>
    @currentUser.updateCookies(headers, @config.appId) if (headers? and provider == 'hull')

module.exports = Api
