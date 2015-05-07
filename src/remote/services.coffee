_                     = require '../utils/lodash'

ServiceList           = require './services/list'

RemoteHeaderStore     = require '../flux/stores/RemoteHeaderStore'
RemoteHeaderActions   = require '../flux/actions/RemoteHeaderActions'

RemoteConfigStore     = require '../flux/stores/RemoteConfigStore'
RemoteConfigActions   = require '../flux/actions/RemoteConfigActions'

RemoteUserStore       = require '../flux/stores/RemoteUserStore'
RemoteUserActions     = require '../flux/actions/RemoteUserActions'

RemoteSettingsStore   = require '../flux/stores/RemoteSettingsStore'
RemoteSettingsActions = require '../flux/actions/RemoteSettingsActions'

RemoteConstants       = require '../flux/constants/RemoteConstants'

promises              = require '../utils/promises'

handleSpecialRoutes = (request)->
  switch request.path
    when '/api/v1/logout'
      request.nocallback = true
      RemoteUserActions.clear()
      break

  request

maybeUpdateUser = (response)->
  headerId = response.headers['Hull-User-Id']
  RemoteHeaderActions.setUserIdHeader(headerId)

  # Pass every return call to the API to maybe update the User if the api call was a '/me' call
  # We do this because Me can have aliases such as the user's ID.
  RemoteUserActions.updateIfMe(response.body) if response.body?.id?

class Services
  constructor : (remoteConfig, gateway)->
    RemoteUserActions.update(remoteConfig.data.me) if (remoteConfig.data.me)
    gateway.after(maybeUpdateUser)
    gateway.before(handleSpecialRoutes)

    @services = _.reduce ServiceList, (memo,Service,key)->
      memo[key] = new Service(remoteConfig,gateway)
      return memo
    ,{}

    RemoteHeaderStore.addChangeListener (change)=>
      switch change
        when RemoteConstants.SET_USER_ID_HEADER
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
    RemoteUserActions.clearUserToken(args...)

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
      RemoteUserActions.update(me)
      RemoteSettingsActions.update(settings)
      xdmCallback(me)
      undefined

    onError = (err)->
      xdmErrback(err)
      console.warn 'Promise Fail', err, err.stack
      throw new Error(err)
      undefined

    Promise.all([me, settings])
    .then onSuccess, onError
    .catch onError

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
