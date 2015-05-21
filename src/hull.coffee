# # This file is responsible for defining window.Hull
# # and providing pooled methods to the user while
# # Hull is actually loading.

Promise     = require('es6-promise').Promise
assign      = require './polyfills/assign'
_           = require './utils/lodash'
polyfill    = require './utils/load-polyfills'
Client      = require './client'
CurrentUser = require './client/current-user'
Channel     = require './client/channel'
Api         = require './client/api'

EventBus    = require './utils/eventbus'
Pool        = require './utils/pool'
HullRemote  = require './hull-remote'
embeds      = require './client/embeds'
configCheck = require './client/config-check'
getScriptTagConfig = require './client/script-tag-config'
initializePlatform = require './client/initialize-platform'

###*
 * Wraps the success callback
 *
 * Extends the global object
 * Reinjects events in the live app from the pool
 * Replays the track events
 * @param  {function} userSuccessCallback the function that will be called if everything went well
 * @param  {object} _hull               an partial build of the Hull object
 * @param  {object} data                config data coming from the Remote
 * @return {object}                     the Hull object
###
onInitSuccess = (userSuccessCallback, hull, data)->
  userSuccessCallback = userSuccessCallback || ->
  {me, app, org} = data

  embeds.initialize({ org });
  hull.embed = embeds.embed
  hull.onEmbed = embeds.onEmbed

  # We're on the client.
  delete hull.initRemote

  # Prune init queue
  Pool.run('track', hull)

  # Execute Hull.init callback
  ready.resolve {hull, me, app, org}

  EventBus.emit('hull.ready', hull, me, app, org)
  EventBus.emit('hull.init', hull, me, app, org)
  console.debug("Hull.js version \"#{hull.version}\" started")

  # Do Hull.embed(platform.deployments) automatically
  embeds.embed(app.deployments,{},onEmbedComplete) if hull.config().embed!=false and _.isArray(app?.deployments) and app.deployments.length>0

  # Everything went well, call the init callback
  userSuccessCallback(hull, me, app, org)

  hull

# Wraps init failure
onInitFailure = (err)-> throw err

onEmbedComplete = ()->
  console.debug("Hull Embeds Completed successfully") if hull.config().debug

###*
 * Main Hull Entry Point
 *
 * Will only be executed once.
 * @param  {[type]} config={}         [description]
 * @param  {[type]} userSuccessCallback [description]
 * @param  {[type]} userFailureCallback [description]
 * @return {[type]}                     [description]
###
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

  err = (err)->
    # Something was wrong while initializing
    console.error(err.stack);
    userFailureCallback = userFailureCallback || ->
    userFailureCallback(err)
    ready.reject(err)

  # Ensure we have everything we need before starting Hull
  configCheck(config).then ()->
    # Load polyfills
    polyfill.fill(config)
  .then ()=>
    # Create the communication channel with Remote
    channel = new Channel(config, currentUser)
    channel.promise
  ,err
  .then (channel)=>
    # Create the Hull client that stores the API, Auth, Sharing and Tracking objects.
    client = new Client(config, channel, currentUser)
  , onInitFailure
  ,err
  .then (hullClient)=>
    # Initialize
    client.hull = assign(hull,client.hull)
    data = client.remoteConfig.data
    currentUser.init(data.me)
    initializePlatform(data, config, client.hull)
    onInitSuccess(userSuccessCallback, client.hull, data)
  ,err
  .catch err

ready = {}
ready.promise = new Promise (resolve, reject)=>
  ready.reject = reject
  ready.resolve = resolve

ready.promise.catch (err)-> throw new Error('Hull.ready callback error', err)

hullReady = (callback, errback)->
  callback = callback || ->
  errback = errback   || ->
  ready.promise.then (res)->
    callback(res.hull, res.me, res.app, res.org)
  , errback
  .catch (err)-> console.error err.message, err.stack

shimmedMethod = (method)->
  console.debug("Hull.#{method} is only useful when Ships are sandboxed. This method does nothing here")
  false

hull =
  _initialized : false
  initRemote   : HullRemote
  init         : init
  ready        : hullReady
  version      : VERSION
  track        : Pool.create('track')
  autoSize     : -> shimmedMethod("autoSize")
  setShipStyle : -> shimmedMethod("setShipStyle")
  setShipSize  : -> shimmedMethod("setShipSize")

# Assign EventBus methods to Hull
eeMethods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'emit']
_.map eeMethods, (m)->
  hull[m] = (args...) -> EventBus[m](args...)

autoStartConfig = getScriptTagConfig()
if autoStartConfig && autoStartConfig.autoStart
  if !hull._initialized
    autoStartConfig && autoStartConfig.autoStart && init(autoStartConfig)

window.Hull = hull
module.exports = hull
