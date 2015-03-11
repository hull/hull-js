assign      = require 'object-assign'
_           = require './utils/lodash'
Client      = require './client'

CurrentUser = require './client/current-user'
Channel     = require './client/channel'
Api         = require './client/api'

promises    = require './utils/promises'
EventBus    = require './utils/eventbus'
Pool        = require './utils/pool'
HullRemote  = require './hull-remote'
embeds      = require './client/embeds'

require './utils/console-shim'

# # This file is responsible for defining window.Hull
# # and providing pooled methods to the user while
# # Hull is actually loading.
# #
# # It provides some global code that is to be executed immediately
# # and an AMD module,
# # The AMD module loads a particvular flavour of Hull, defined as a set of 3 methods:
# # * init: Returns a promise or a value that indicates the success or failure of the loading process
# # * success: will to be executed if the app is loaded correctly
# # * failure: will be executed if the app fails to load
# #
# # The global code only defines some methods into window.Hull and pools the parameters
# # to replay them if the app has loaded correctly
# #

# * Augments coniguration
# * Adds a callback when ready
_initialized = false

checkConfig = (config)->
  dfd = promises.deferred();
  msg = "You need to pass some keys to Hull to start it: " 
  readMore = "Read more about this here : http://www.hull.io/docs/references/hull_js/#hull-init-params-cb-errb"
  # Fail right now if we don't have the required setup
  if config.orgUrl and config.appId
    # Auto add protocol if we dont have one of http://, https://, //
    config.orgUrl ="https://#{config.orgUrl}" unless config.orgUrl.match(/^(http[s]?:)?\/\//)
    dfd.resolve()
  else
    dfd.reject(new Error "#{msg} We couldn't find `orgUrl` in the config object you passed to `Hull.init`\n #{readMore}") unless config.orgUrl
    dfd.reject(new Error "#{msg} We couldn't find `platformId` in the config object you passed to `Hull.init`\n #{readMore}") unless config.appId
  return dfd.promise

# Wraps the success callback
# * Extends the global object
# * Reinjects events in the live app from the pool
# * Replays the track events
onInitSuccess = (userSuccessCallback, _hull, data)->
  userSuccessCallback = userSuccessCallback || ->
  hull = _hull
  {me, app, org} = data

  hull.embed = embeds.embed
  hull.onEmbed = embeds.onEmbed

  # We're on the client.
  delete hull.initRemote

  # Prune init queue
  Pool.run('track', hull)

  # Execute Hull.init callback
  readyDfd.resolve {hull, me, app, org}

  EventBus.emit('hull.ready', hull, me, app, org)
  EventBus.emit('hull.init', hull, me, app, org)
  console.info("Hull.js version \"#{hull.version}\" started")

  # Do Hull.embed(platform.deployments) automatically
  embeds.embed(app.deployments) if _.isArray(app?.deployments) and app.deployments.length>0

  # Everything went well, call the init callback
  userSuccessCallback(hull, me, app, org)

  hull

# Wraps config failure
onConfigFailure = (err)->
  throw new Error(err)

# Wraps init failure
onInitFailure = (err)->
  throw new Error("We couldn't load the Hull server after trying for 30 seconds. Something about connectivity ?")

# Parse the tracked events configuration and standardize it.
getTrackConfig = (cfg)->
  return undefined unless cfg?
  switch (Object.prototype.toString.call(cfg).match(/^\[object (.*)\]$/)[1])
    when "Object"
      if cfg.only?
        { only: (m.toString() for m in cfg.only) }
      else if cfg.ignore?
        { ignore: (m.toString() for m in cfg.ignore) }
    when "RegExp"
      { only: cfg.toString() }
    when "Array"
      { only: (m.toString() for m in cfg)  }




readyDfd = promises.deferred()
readyDfd.promise.catch (err)-> throw new Error('Hull.ready callback error', err)


#Main Hull Entry Point
init = (config, userSuccessCallback, userFailureCallback)->
  if _initialized
    throw new Error('Hull.init can be called only once')
    return

  _initialized = true

  client  = {}
  channel = {}

  #TODO
  config.version    = VERSION
  config.debug      = config.debug && { enable: true }
  config.track      = getTrackConfig(@config.track) if config.track?
  config.appId = config.appId || config.platformId || config.shipId
  delete config.platformId if config.platformId?
  delete config.ship if config.ship?
  #END


  currentUser =  new CurrentUser()

  checkConfig(config)
  .then ()=>
    channel = new Channel(config, currentUser)
    channel.promise
  , onConfigFailure

  .then (channel)=>
    client = new Client(config, channel, currentUser)
  , onInitFailure

  .then (hullClient)=>
    client.hull = assign(hull,client.hull)
    data = client.remoteConfig.data
    currentUser.init(data.me)
    onInitSuccess(userSuccessCallback, client.hull, data)

  ,(err)->
    console.error(err.stack);
    userFailureCallback = userFailureCallback || ->
    userFailureCallback(err)
    readyDfd.reject(err)

hullReady = (callback, errback)->
    callback = callback || ->
    errback = errback   || ->
    readyDfd.promise
    .then (res)->
      callback(res.hull, res.me, res.app, res.org)
    , errback
    .catch (err)->
      console.error err.stack

hullSetShipSize = ->
  console.log("SetShipSize is only useful when Ships are sandboxed. This method does nothing here")
  false

hull =
  initRemote  : HullRemote
  init        : init
  version     : VERSION
  track       : Pool.create('track')
  setShipSize : hullSetShipSize
  ready       : hullReady

# Assign EventBus methods to Hull
eeMethods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'emit']
_.map eeMethods,(m)=>
  hull[m] = (args...)->EventBus[m](args...)

window.Hull = hull
module.exports = hull
