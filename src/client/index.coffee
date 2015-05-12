_            = require '../utils/lodash'
clone        = require '../utils/clone'
EventBus     = require '../utils/eventbus'
Entity       = require '../utils/entity'
cloneConfig  = require '../utils/clone-config'
findUrl      = require '../utils/find-url'

Api          = require './api'
Auth         = require './auth'
Flag         = require './flag/index'
Tracker      = require './track/index'
Traits       = require './traits/index'
Sharer       = require './sharer/index'

utils        = require '../utils/utils'


class Client
  constructor: (config={}, channel, currentUser)->

    @config = clone(config)
    @remoteConfig = clone(channel.remoteConfig)

    api   = new Api(config, channel, currentUser)
    auth  = new Auth(api)
    tracker = new Tracker(api, @remoteConfig, @config)

    sharer = new Sharer(api, auth, currentUser, @remoteConfig.data, @config)
    flag  = new Flag(api)
    traits= new Traits(api)

    if config.debug
      EventBus.on 'hull.**', (arg0, arg1, arg2)->
        # Dont use spread because IE8 doesnt' treat console.log as a real function hence can't do console.log.apply.
        # Duh...
        console.debug("--HULL EVENT--[#{@event}]--", arg0, arg1, arg2);

    # Creating the complete hull object we'll send back to the API
    @hull =
      config         : cloneConfig(config, @remoteConfig)
      utils          : utils
      api            : api.message
      currentUser    : currentUser.get
      entity         : Entity
      signup         : auth.signup
      logout         : auth.logout
      login          : auth.login
      linkIdentity   : auth.linkIdentity
      unlinkIdentity : auth.unlinkIdentity
      track          : tracker.track
      flag           : flag
      traits         : traits
      share          : sharer.share
      findUrl        : findUrl

    # Return an object that will be digested by Hull main file and
    # has everything

    @hull

module.exports = Client
