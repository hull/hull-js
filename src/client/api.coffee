Promise   = require('es6-promise').Promise
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

    @currentUser.setCookies(data.headers, currentConfig.get('appId')) if (data.headers?)

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

    new Promise (resolve, reject)=>
      onSuccess = (res={})=>
        # intercept calls and update current user
        @updateCurrentUser(res).then () =>
          @updateCurrentUserCookies(res.headers, res.provider)
          callback(res.body)
          resolve(res.body)

      onError = (response, error)=>
        errback(response.message, error)
        reject(response.message, error)

      @channel.rpc.message(opts, onSuccess, onError)

  refreshUser: ()=>
    new Promise (resolve, reject)=>
      onSuccess  = (response={})=>
        @currentUser.set(response.me)
        @currentConfig.setRemote(response.services, 'services')
        @updateCurrentUserCookies(response.headers, 'hull')
        resolve(response.me)

      onError = (err={})=>
        reject(err)

      @channel.rpc.refreshUser(onSuccess, onError)

  updateCurrentUser: (response) =>
    header = response.headers?['Hull-User-Id']

    p = Promise.resolve()
    return p unless header?

    if response.body?.id == header
      # Set currentUser to the response body if it contains the current user.
      @currentUser.set(response.body)
    else
      # Fetch the currentUser from the server if the header does not match with
      # the currentUser id.
      u = @currentUser.get()
      p = @refreshUser() if !u || u.id != header

    return p

  _updateCurrentUser: (user={}, headers={})=>
    header = headers?['Hull-User-Id']
    @currentUser.set(user) if header && user?.id == header

  updateCurrentUserCookies: (headers, provider)=>
    @currentUser.setCookies(headers, @currentConfig.get('appId')) if (headers? and provider == 'hull')

module.exports = Api
