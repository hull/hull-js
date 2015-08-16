Promise   = require('es6-promise').Promise
cookie    = require '../utils/cookies'
EventBus  = require '../utils/eventbus'
logger    = require '../utils/logger'
parseOpts = require './parse-opts'
channel   = require './channel'

class Api
  constructor : (channel, currentUser, currentConfig)->
    @channel = channel
    @currentConfig = currentConfig
    @currentUser = currentUser

    EventBus.on 'hull.settings.update', (settings)-> currentConfig.setRemote(settings,'settings')

    data = @currentConfig.getRemote('data')
    authScope = if data.headers?['Hull-Auth-Scope'] then data.headers['Hull-Auth-Scope'].split(":")[0] else ''

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
        # intercept calls and update current user
        @updateCurrentUser(res.body, res.headers);
        @updateCurrentUserCookies(res.headers, res.provider)
        callback(res.body)
        resolve(res.body)

      onError = (response, error)=>
        errback(response.message, error)
        reject(response.message, error)

      @channel.rpc.message(opts, onSuccess, onError)

  refreshUser   : ()=>
    new Promise (resolve, reject)=>
      onSuccess  = (response={})=>
        @currentUser.set(response.me)
        @currentConfig.setRemote(response.services, 'services')
        resolve(response.me)

      onError   = (err={})=>
        reject(err)

      @channel.rpc.refreshUser(onSuccess, onError)

  updateCurrentUser: (user={}, headers={})=>
    header = headers?['Hull-User-Id']
    @currentUser.set(user) if header && user?.id == header

  updateCurrentUserCookies: (headers, provider)=>
    @currentUser.setCookies(headers, @currentConfig.get('appId')) if (headers? and provider == 'hull')

module.exports = Api
