# # This file is responsible for defining window.Hull
# # and providing pooled methods to the user while
# # Hull is actually loading.

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
configCheck = require './client/config-check'
getScriptTagConfig = require './client/script-tag-config'

require './utils/console-shim'

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
  embeds.embed(app.deployments) if hull.config().embed!='false' and _.isArray(app?.deployments) and app.deployments.length>0

  # Everything went well, call the init callback
  userSuccessCallback(hull, me, app, org)

  hull

# Wraps init failure
onInitFailure = (err)-> throw err

#Main Hull Entry Point
init = (config={}, userSuccessCallback, userFailureCallback)->
  if !!hull._initialized
    throw new Error('Hull.init can be called only once')
    return

  config.version = VERSION
  config.debug   = config.debug && { enable: true }
  config.appId   = config.appId || config.platformId || config.shipId
  delete config.platformId if config.platformId?
  delete config.ship       if config.ship?

  missing = []
  missing.push "orgUrl" unless config.orgUrl?
  missing.push "platformId" unless config.appId?
  throw new Error("Hull config error: You forgot to pass #{missing.join(',')} needed to initialize hull properly") if missing.length

  hull._initialized = true

  client  = {}
  channel = {}


  currentUser =  new CurrentUser()

  configCheck(config)
  .then ()=>
    channel = new Channel(config, currentUser)
    channel.promise

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

# Hull.ready promise chain
readyDfd = promises.deferred()
readyDfd.promise.catch (err)-> throw new Error('Hull.ready callback error', err)
hullReady = (callback, errback)->
  callback = callback || ->
  errback = errback   || ->
  readyDfd.promise
  .then (res)->
    callback(res.hull, res.me, res.app, res.org)
  , errback
  .catch (err)->
    console.error err.stack

hull =
  _initialized: false
  initRemote  : HullRemote
  init        : init
  ready       : hullReady
  version     : VERSION
  track       : Pool.create('track')
  setShipStyle : ->
    console.log("Hull.setShipStyle is only useful when Ships are sandboxed. This method does nothing here")
    false
  setShipSize : ->
    console.log("Hull.setShipSize is only useful when Ships are sandboxed. This method does nothing here")
    false

# Assign EventBus methods to Hull
eeMethods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'emit']
_.map eeMethods, (m)->
  hull[m] = (args...) -> EventBus[m](args...)


autostart = ->
  if !hull._initialized && !window.Hull
    autoStartConfig = getScriptTagConfig()
    autoStartConfig && autoStartConfig.autoStart && init(autoStartConfig)

autostart()

window.Hull = hull
module.exports = hull
