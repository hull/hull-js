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
Sharer       = require './sharer/index'
QueryString  = require './querystring/index'

utils        = require '../utils/utils'


class Client
  constructor: (channel, currentUser, currentConfig)->

    @currentConfig = currentConfig

    api     = new Api(channel, currentUser, currentConfig)
    alias  = (id) -> api.message({ path: "/me/alias" }, "post", { anonymous_id: id })
    auth    = new Auth(api, currentUser, currentConfig)
    tracker = new Tracker(api)

    sharer = new Sharer(currentConfig);
    flag   = new Flag(api)
    traits = (payload) -> api.message({ path: '/me/traits' }, 'put', payload)
    qs     = new QueryString(traits, tracker.track, alias)

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
      resetPassword  : auth.resetPassword
      confirmEmail   : auth.confirmEmail
      linkIdentity   : auth.linkIdentity
      unlinkIdentity : auth.unlinkIdentity
      track          : tracker.track
      trackForm      : tracker.trackForm
      alias          : alias
      flag           : flag
      identify       : traits
      traits         : traits
      share          : sharer.share
      findUrl        : findUrl
      parseQueryString : qs.parse

    # Return an object that will be digested by Hull main file and
    # has everything

    @hull

module.exports = Client
