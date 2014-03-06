# This file is responsible for defining window.Hull
# and providing pooled methods to the user while
# Hull is actually loading.
#
# It provides some global code that is to be executed immediately
# and an AMD module,
# The AMD module loads a particvular flavour of Hull, defined as a set of 3 methods:
# * init: Returns a promise or a value that indicates the success or failure of the loading process
# * success: will to be executed if the app is loaded correctly
# * failure: will be executed if the app fails to load
#
# The global code only defines some methods into window.Hull and pools the parameters
# to replay them if the app has loaded correctly
#

unless window.console and console.log
  (->
    noop = ->

    methods = ["assert", "clear", "count", "debug", "dir", "dirxml", "error", "exception", "group", "groupCollapsed", "groupEnd", "info", "log", "markTimeline", "profile", "profileEnd", "markTimeline", "table", "time", "timeEnd", "timeStamp", "trace", "warn"]
    length = methods.length
    console = window.console = {}
    console[methods[length]] = noop  while length--
  )()


#
# Utilities
#
ENV = if HULL_ENV? then HULL_ENV else ''
_extend = null
currentFlavour = null

createLock = ()->
  _open = false
  _cbs = []
  run: (cb)->
    if _open
      cb()
    else
      _cbs.push cb

  unlock: ()->
    _open = true
    cb() for cb in _cbs

# Helpers to manage the calls to functions defined from the start
# event if they are not available
_pool = _pool || {}
createPool = (name)->
  _pool[name] ?= []
  (args...)-> _pool[name].push args
deletePool = (name)->
  delete _pool[name]

rerun = (name, withObj)->
  withObj[name](data...) for data in _pool[name]
  deletePool(name)


#
# "Real" code
#

lock = createLock()

# * Augments coniguration
# * Adds a callback when ready
_mainCalled = false
preInit = (isMain, config, cb, errb)->
  throw new Error('Hull.init can be called only once') if isMain and _mainCalled
  _mainCalled = true if isMain

  lock.run ->
    _config = _extend {}, config
    _config.namespace = 'hull'
    _config.debug = config.debug && { enable: true }
    _success = (args...)-> successCb [config, isMain, cb or ->].concat(args)...
    _failure = (args...)-> failureCb [isMain, errb or ->].concat(args)...
    currentFlavour.init(_config).then(_success, _failure).done()
    console.info("Hull.js version \"#{_hull.version}\" started")

initApi = (config, args...)->
  config.apiOnly = true
  preInit [false, config].concat(args)...

initMain = (config, args...)->
  preInit [true, config].concat(args)...

_hull = window.Hull =
  on:         createPool 'on'
  track:      createPool 'track'
  ready:      createPool 'ready'
  init:       initMain

_hull.init.api = initApi

_hull.component =  createPool 'component' if ENV=="client"

# Wraps the success callback
# * Extends the global object
# * Reinjects events in the live app from the pool
# * Replays the track events
successCb = (config, isMain, success, args...)->
  extension = currentFlavour.success(args...)
  context = extension.context
  _config = _extend {}, config
  _final = _extend {}, _hull, extension.exports,
    ready: (fn)->
      fn(_final, context.me, context.app, context.org)

  if isMain
    window.Hull = _final
    rerun('on', _final)
    rerun('track', _final)
    rerun('component', _final) if ENV=="client"
  else
    delete _final.component #FIXME hackish

  rerun('ready', _final)
  # Execute Hull.init callback
  _final.emit('hull.init', _final, extension.context.me, extension.context.app, extension.context.org)

  # Prune init queue
  success(_final, extension.context.me, extension.context.app, extension.context.org)

  _final


# Wraps the failure callback
# * Executes the failure behaviour defined by the current flavour
failureCb = (isMain, userFailureFn, err, args...)->
  currentFlavour.failure(err)
  userFailureFn([err].concat(args)...)

require ['flavour', 'underscore', 'lib/utils/version'], (flavour, _, version)->
  _hull.version = version
  _extend = _.extend
  currentFlavour = flavour
  lock.unlock()

