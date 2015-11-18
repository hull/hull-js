# # This file is responsible for defining window.Hull
# # and providing pooled methods to the user while
# # Hull is actually loading.

Promise     = require('es6-promise').Promise
assign      = require './polyfills/assign'
_           = require './utils/lodash'
polyfill    = require './utils/load-polyfills'
logger      = require './utils/logger'
Client      = require './client'
CurrentUser = require './client/current-user'
CurrentConfig = require './client/current-config'
Channel     = require './client/channel'
Api         = require './client/api'

EventBus    = require './utils/eventbus'
Pool        = require './utils/pool'
HullRemote  = require './hull-remote'
embeds      = require './client/embeds'
scriptTagConfig = require './client/script-tag-config'
initializePlatform = require './client/initialize-platform'
decodeHash  = require './utils/decode-hash'
displayBanner = require './utils/ui/display-banner'

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
  logger.log("Hull.js version \"#{hull.version}\" started")

  # Do Hull.embed(platform.deployments) automatically
  if hull.config().embed != false
    if _.isArray(app?.deployments) and app.deployments.length>0
      embeds.embed(app.deployments,{},onEmbedComplete, onEmbedError)
    else
      onEmbedComplete()

  hash = decodeHash()
  snippet = hash?.hull?.snippet
  if snippet
    config = hull.config()
    origin = snippet.origin
    platformOk = snippet.platformId == config.appId

    snippetOrgUrl = snippet.orgUrl.replace(/^http:/,'https:')
    orgUrl = config.orgUrl.replace(/^http:/,'https:')
    orgOk = snippetOrgUrl == orgUrl

    check  = snippet.check

    window.location.hash=""
    if(orgOk && platformOk)
      opener.postMessage({ result: check }, origin);
      EventBus.once 'hull.snippet.success', ()->
        opener.postMessage({ result: check }, origin);
        window.close()
      displayBanner('platform')
    else
      response = { code:'invalid', orgUrl: orgUrl, platformId: config.appId }
      opener.postMessage({ error: btoa(JSON.stringify(response)) }, origin);
  # Everything went well, call the init callback
  userSuccessCallback(hull, me, app, org)

  hull

# Wraps init failure
onInitFailure = (err)-> throw err

onEmbedComplete = ()->
  EventBus.emit('hull.ships.ready');
  logger.log("Hull Embeds Completed successfully")

onEmbedError = (err...)->
  logger.error("Failed embedding Ships", err...)

parseHash = ()->
  return if window.location.href.match('//.+\.hullapp\.io/.+/remote.html') # prevent this when in remote.html

  hash = decodeHash()
  if hash? && hash.hasOwnProperty('success')
    window.location.hash = ''

    if window?.opener?.Hull? and window?.opener?.__hull_login_status__
      window.opener.__hull_login_status__(hash)
      window.close()

parseHash()

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
  # Process this as a single object we send to Remote side (cleaner)
  config.debug   = if config.debug then { enabled: true, verbose: config.verbose } else { }
  logger.init(config.debug)
  config.appId   = config.appId || config.platformId || config.shipId
  delete config.platformId if config.platformId?
  delete config.shipId       if config.shipId?

  missing = []
  missing.push "orgUrl" unless config.orgUrl?
  missing.push "platformId" unless config.appId?
  httpsRegex = /^https:|^\/\//
  throw new Error("[Hull.init] jsUrl NEEDS be loaded via https if orgUrl is https") if config.jsUrl and not httpsRegex.test(config.jsUrl) and httpsRegex.test(config.jsUrl)
  throw new Error("[Hull.init] You forgot to pass #{missing.join(',')} needed to initialize hull properly") if missing.length

  hull._initialized = true

  client  = {}
  channel = {}

  currentUser =    new CurrentUser()
  currentConfig =  new CurrentConfig()

  throwErr = (err)->
    # Something was wrong while initializing
    logger.error(err.stack)
    userFailureCallback = userFailureCallback || ->
    userFailureCallback(err)
    ready.reject(err)

  # Ensure we have everything we need before starting Hull
  currentConfig.init(config).then (config)->
    # Load polyfills
    polyfill.fill(config)
    config
  .then (currentConfig)=>
    # Create the communication channel with Remote
    channel = new Channel(currentUser, currentConfig)
    channel.promise
  , throwErr
  .then (channel)=>
    # Create the Hull client that stores the API, Auth, Sharing and Tracking objects.
    client = new Client(channel, currentUser, currentConfig)
  , onInitFailure
  , throwErr
  .then (hullClient)=>
    # Initialize
    client.hull = assign(hull,client.hull)
    data = currentConfig.getRemote('data')
    currentUser.init(data?.me)
    initializePlatform(data, currentConfig, client.hull)
    onInitSuccess(userSuccessCallback, client.hull, data)
  , throwErr
  .catch throwErr



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
  .catch (err)-> logger.error err.message, err.stack

shimmedMethod = (method)->
  logger.log("Hull.#{method} is only useful when Ships are sandboxed. This method does nothing here")
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

unless window.Hull?
  autoStartConfig = scriptTagConfig()
  if autoStartConfig && autoStartConfig.autoStart
    if !hull._initialized
      autoStartConfig && autoStartConfig.autoStart && init(autoStartConfig)

  window.Hull = hull
  setTimeout ->
    window.hullAsyncInit(hull) if window?.hullAsyncInit and _.isFunction(window.hullAsyncInit)
  , 0
else
  logger.error "Hull Snippet found more than once (or you already have a global variable named window.Hull). Either way, we can't launch Hull more than once. We only use the first one in the page"

module.exports = hull


