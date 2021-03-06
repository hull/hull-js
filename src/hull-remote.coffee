require './utils/load-polyfills'

Raven             = require './utils/raven'
EventBus          = require './utils/eventbus'
logger            = require './utils/logger'
configNormalize   = require './utils/config-normalizer'
locationOrigin    = require './utils/location-origin'
qs                = require './utils/query-string-encoder'
Services          = require './remote/services'
Gateway           = require './remote/gateway'
Channel           = require './remote/channel'

ClientConfigStore = require './flux/stores/ClientConfigStore'
RemoteHeaderStore = require './flux/stores/RemoteHeaderStore'
RemoteUserStore   = require './flux/stores/RemoteUserStore'
RemoteConfigStore = require './flux/stores/RemoteConfigStore'

RemoteActions     = require './flux/actions/RemoteActions'
RemoteConstants   = require './flux/constants/RemoteConstants'



captureException = (err, ctx)->
  Raven.captureException(err, ctx)

hull = undefined


Hull = (remoteConfig)->
  return hull if hull
  config = configNormalize(remoteConfig)

  Raven.init(config.queryParams.ravenDsn, {
    runtime: 'hull-remote',
    orgUrl: locationOrigin(),
    appId: config.appId
  })

  # The access token stuff is a Safari hack:
  # Safari doesn't send response tokens for remote exchange
  RemoteActions.updateRemoteConfig(config)

  hull        = {config}
  gateway     = new Gateway(config)
  services    = new Services(config, gateway)
  channel     = new Channel(config, services)

  ClientConfigStore.addChangeListener (change)=>
    logger.init((ClientConfigStore.getState()||{}).debug)

  RemoteConfigStore.addChangeListener (change)=>
    # Notify client whenever settings change
    switch change
      when RemoteConstants.UPDATE_REMOTE_CONFIG, RemoteConstants.UPDATE_SETTINGS
        channel.rpc.configUpdate(RemoteConfigStore.getState())
        break

  RemoteUserStore.addChangeListener (change)=>
    # Notify client whenever user changes
    switch change
      when RemoteConstants.UPDATE_USER, RemoteConstants.CLEAR_USER
        channel.rpc.userUpdate(RemoteUserStore.getState().user)
        break

  request = services.services.hull.request

  hideOnClick = (e)-> channel.rpc.hide()

  subscribeToEvents  = (clientConfig)->

    if document.addEventListener
      document.addEventListener('click', hideOnClick)
    else if document.attachEvent
      document.attachEvent('onclick', hideOnClick)

    EventBus.on 'remote.iframe.show',  ()-> channel.rpc.show()
    EventBus.on 'remote.iframe.hide',  ()-> channel.rpc.hide()

    EventBus.on 'remote.track',        (payload)->
      services.services.track.request({params:payload.params, path:payload.event})

    EventBus.on 'remote.tracked',        (payload)->
      channel.rpc.track(payload)

    clientConfig


  channel.promise
  .then(subscribeToEvents)
  .then (clientConfig)->
    RemoteActions.updateClientConfig(clientConfig)
  .catch (err)->
    captureException(err)
    console.error("Could not initialize Hull: #{err.message}")

Hull.version = VERSION
module.exports = Hull
