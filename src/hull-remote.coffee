EventBus          = require './utils/eventbus'
logger            = require './utils/logger'
ConfigNormalizer  = require './utils/config-normalizer'
Services          = require './remote/services'
Gateway           = require './remote/gateway'
Channel           = require './remote/channel'

ClientConfigStore = require './flux/stores/ClientConfigStore'
RemoteHeaderStore = require './flux/stores/RemoteHeaderStore'
RemoteUserStore   = require './flux/stores/RemoteUserStore'
RemoteConfigStore = require './flux/stores/RemoteConfigStore'

RemoteActions     = require './flux/actions/RemoteActions'
RemoteConstants   = require './flux/constants/RemoteConstants'



hull = undefined


Hull = (remoteConfig)->
  return hull if hull
  config = ConfigNormalizer(remoteConfig)
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
      when RemoteConstants.UPDATE_REMOTE_CONFIG
        channel.rpc.settingsUpdate(RemoteConfigStore.getState())
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
      services.services.track.request(payload.event, payload.params)

    EventBus.on 'remote.tracked',        (payload)->
      channel.rpc.track(payload)

    clientConfig


  channel.promise
  .then(subscribeToEvents)
  .then (clientConfig)->
    RemoteActions.updateClientConfig(clientConfig)
  .catch (err)-> console.error("Could not initialize Hull: #{err.message}")

Hull.version = VERSION
module.exports = Hull
