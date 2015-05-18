_                     = require '../utils/lodash'
assign                = require '../polyfills/assign'

ServiceList           = require './services/list'

RemoteHeaderStore     = require '../flux/stores/RemoteHeaderStore'
RemoteUserStore       = require '../flux/stores/RemoteUserStore'
RemoteConfigStore   = require '../flux/stores/RemoteConfigStore'

RemoteActions         = require '../flux/actions/RemoteActions'
RemoteConstants       = require '../flux/constants/RemoteConstants'

handleSpecialRoutes = (request)->
  switch request.path
    when '/api/v1/logout'
      request.nocallback = true
      RemoteActions.clearUser()
      break

  request

maybeUpdateUser = (response)->
  # Pass every return call to the API to maybe update the User if the api call was a '/me' call
  # We do this because Me can have aliases such as the user's ID.
  RemoteActions.updateUserIfMe(response)

class Services
  constructor : (remoteConfig, gateway)->
    RemoteActions.updateUser(remoteConfig.data.me) if (remoteConfig.data.me)
    gateway.after(maybeUpdateUser)
    gateway.before(handleSpecialRoutes)

    @services = _.reduce ServiceList, (memo,Service,key)->
      memo[key] = new Service(remoteConfig,gateway)
      return memo
    ,{}

    RemoteHeaderStore.addChangeListener (change)=>
      switch change
        when RemoteConstants.UPDATE_USER_IF_ME
          # Auto-Fetch the user everytime the Hull-User-Id header changes
          userHeaderId = RemoteHeaderStore.getHeader('Hull-User-Id')
          user = RemoteUserStore.getState().user
          @onRefreshUser() if userHeaderId != user?.id
          break

  getMethods : ()->
    {
      ready : @onReady
      message : @onMessage
      clearUserToken : @onClearUserToken
      refreshUser : @onRefreshUser
    }

  onReady : (req, xdmCallback, xdmErrback) ->

  onClearUserToken : (args...)=>
    RemoteActions.clearUserToken(args...)

  onRefreshUser : (xdmCallback, xdmErrback)=>
    xdmCallback ?=->
    xdmErrback  ?=->
    # Those calls skip the middleware queue to prevent request loops
    me = @services.hull.request({path:'me',nocallback:true})
    settings = @services.hull.request({path:'app/settings',nocallback:true})

    onSuccess =  (res)=>
      # Refreshing the User results in us setting everything up again
      me = res[0].body;
      settings = res[1].body
      config = assign({},RemoteConfigStore.getState(),{settings:settings});
      RemoteActions.updateUser(me)
      RemoteActions.updateRemoteConfig(config)
      # Do not send the data back. We're just refreshing stuff.
      # Data will come back through even handlers on Flux Stores
      # xdmCallback(res)
      undefined

    onError = (res)->
      error = new Error(res.response.message)
      xdmErrback(error)
      console.warn 'Promise Fail', error.message, error.stack
      throw error
      error
      undefined

    Promise.all([me, settings])
    .then onSuccess, onError

    undefined

  handleAdminCall: (request, callback, errback)=>

  onMessage : (request, xdmCallback, xdmErrback)=>
    xdmCallback ?=->
    xdmErrback  ?=->
    throw new Error("Path not recognized #{JSON.stringify(request, null, 2)}") unless request.path
    service = @services[request.provider]
    if _.isFunction service.request
      service.request(request, xdmCallback, xdmErrback)
      return undefined
    else
      xdmErrback request

    undefined

module.exports = Services
