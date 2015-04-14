EventBus            = require './utils/eventbus'
ConfigNormalizer    = require './utils/config-normalizer'
Services            = require './remote/services'
Gateway             = require './remote/gateway'
Channel             = require './remote/channel'


RemoteHeaderStore   = require './flux/stores/RemoteHeaderStore'
RemoteHeaderActions = require './flux/actions/RemoteHeaderActions'

RemoteConfigStore   = require './flux/stores/RemoteConfigStore'
RemoteConfigActions = require './flux/actions/RemoteConfigActions'

RemoteUserStore     = require './flux/stores/RemoteUserStore'
RemoteUserActions   = require './flux/actions/RemoteUserActions'

RemoteSettingsStore     = require './flux/stores/RemoteSettingsStore'
RemoteSettingsActions   = require './flux/actions/RemoteSettingsActions'

RemoteConstants     = require './flux/constants/RemoteConstants'

hull = undefined


Hull = (remoteConfig)->
  return hull if hull

  config = ConfigNormalizer(remoteConfig)
  # The access token stuff is a Safari hack:
  # Safari doesn't send response tokens for remote exchange
  RemoteHeaderActions.setAppIdHeader(config.appId)
  RemoteHeaderActions.setTokenHeader(config.access_token) if config?.access_token
  RemoteConfigActions.updateRemoteConfig(config)

  hull        = {config}
  gateway     = new Gateway(config)
  services    = new Services(config, gateway)
  channel     = new Channel(config, services)

  request = services.services.hull.request

  hideOnClick = (e)-> channel.rpc.hide()

  subscribeToEvents  = (clientConfig)->

    if document.addEventListener
      document.addEventListener('click', hideOnClick)
    else if document.attachEvent
      document.attachEvent('onclick', hideOnClick)

    EventBus.on 'remote.iframe.show',  -> channel.rpc.show()
    EventBus.on 'remote.iframe.hide',  -> channel.rpc.hide()
    EventBus.on 'remote.track', (payload)->
      channel.rpc.track(payload)
      services.services.track.request(payload.event, payload.params)
    clientConfig


  RemoteSettingsStore.addChangeListener (change)=>
    state = RemoteSettingsStore.getState()
    # Notify client whenever settings change
    switch change
      when RemoteConstants.UPDATE_SETTINGS
        channel.rpc.settingsUpdate(state.settings)
        break

  RemoteUserStore.addChangeListener (change)=>
    state = RemoteUserStore.getState()
    # Notify client whenever user changes
    switch change
      when RemoteConstants.UPDATE_USER, RemoteConstants.CLEAR_USER
        channel.rpc.userUpdate(state.user)
        break

  channel.promise
  .then(subscribeToEvents)

  .then (clientConfig)->
    RemoteConfigActions.updateClientConfig(clientConfig)

  .fail (err)->
    console.error("Could not initialize Hull: #{err.message}")

  .done()


Hull.version = VERSION
module.exports = Hull
