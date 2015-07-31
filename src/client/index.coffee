_            = require '../utils/lodash'
clone        = require '../utils/clone'
EventBus     = require '../utils/eventbus'
Entity       = require '../utils/entity'
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
  constructor: (channel, currentUser, currentConfig)->

    @currentConfig = currentConfig

    api   = new Api(channel, currentUser, currentConfig)
    auth  = new Auth(api, currentConfig)
    tracker = new Tracker(api)

    sharer = new Sharer(currentConfig);
    flag  = new Flag(api)
    traits= new Traits(api)

    if @currentConfig.get('debug.enabled')
      EventBus.on 'hull.**', (args...)->
        logger.log("--HULL EVENT--[#{@event}]--", args...);

    # Creating the complete hull object we'll send back to the API
    @hull =
      config         : @currentConfig.get
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
      trait          : traits
      share          : sharer.share
      findUrl        : findUrl

    # Return an object that will be digested by Hull main file and
    # has everything

    @hull

module.exports = Client
