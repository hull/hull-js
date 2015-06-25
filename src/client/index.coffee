_            = require '../utils/lodash'
clone        = require '../utils/clone'
EventBus     = require '../utils/eventbus'
Entity       = require '../utils/entity'
cloneConfig  = require '../utils/clone-config'
findUrl      = require '../utils/find-url'
logger       = require '../utils/logger'

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

    sharer = new Sharer(_.pick(@config, 'appId', 'orgUrl'))
    flag  = new Flag(api)
    traits= new Traits(api)

    if config?.debug?.verbose
      EventBus.on 'hull.**', (args...)->
        logger.log("--HULL EVENT--[#{@event}]--", args...);

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
