assign         = require 'object-assign'

promises       = require '../utils/promises'
cookie         = require '../utils/cookies'
EventBus       = require '../utils/eventbus'

parseOpts    = require './parse-opts'
channel        = require './channel'


class Api
  constructor : (config, channel, currentUser)->
    @config = config
    @services = channel.remoteConfig.settings
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
  message       : ()=>
    return console.error("Hull Api is not initialized yet. You should run your app from the callback of Hull.ready()") unless @channel.rpc
    {opts, callback, errback} = parseOpts(Array.prototype.slice.call(arguments))
    deferred = promises.deferred()
    onSuccess = (res={})=>
      @updateCurrentUserCookies(res.headers, res.provider)
      callback(res.body)
      deferred.resolve(res.body)

    onError = (error={})=>
      errback(error.message.response)
      deferred.reject(error.message.response)

    @channel.rpc.message(opts, onSuccess, onError)
    deferred.promise

  clearToken    : (args...)=>
    @channel.rpc.clearUserToken(args...) # No need to be exposed, IMO

  refreshUser   : ()=>
    deferred = promises.deferred()

    onSuccess  = (res={})=>
      @currentUser.update(res)
      deferred.resolve(res)

    onError   = (err={})=>
      deferred.reject(err)

    @channel.rpc.refreshUser(onSuccess, onError)
    return deferred.promise

  updateCurrentUserCookies: (headers, provider)=>
    @currentUser.updateCookies(headers, @config.appId) if (headers? and provider == 'hull')

module.exports = Api
