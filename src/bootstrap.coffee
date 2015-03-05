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
_partial = null
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
  successCbs = [cb or ->]
  errorCbs = [errb or ->]
  throw new Error('Hull.init can be called only once') if isMain and _mainCalled
  _mainCalled = true if isMain

  lock.run ->
    _config = _extend {}, config
    _config.track = getTrackConfig(_config.track) if _config.track?
    _config.namespace = 'hull'
    _config.debug = config.debug && { enable: true }
    _success = (args...)-> successCbRunner [config, isMain, successCbs].concat(args)...
    _failure = (args...)-> failureCbRunner [isMain, errorCbs].concat(args)...
    currentFlavour.init(_config).then(_success, _failure).done()
    console.info("Hull.js version \"#{_hull.version}\" started")
  then: (success, error)->
    successCbs.push success
    errorCbs.push error

initApi = (config, args...)->
  config.apiOnly = true
  preInit [false, config].concat(args)...

initMain = (config, args...)->
  preInit [true, config].concat(args)...

getTrackConfig = (cfg)->
  return unless cfg?
  stringify = (a)->

  ret = switch (Object.prototype.toString.call(cfg).match(/^\[object (.*)\]$/)[1])
    when "Object" 
      if cfg.only?
        { only: (m.toString() for m in cfg.only) }
      else if cfg.ignore?
        { ignore: (m.toString() for m in cfg.ignore) }
    when "RegExp"
      { only: cfg.toString() }
    when "Array"
      { only: (m.toString() for m in cfg)  }
  ret

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
successCbRunner = (config, isMain, successes, args...)->
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
  for success in successes
    fn = _partial(success, _final, extension.context.me, extension.context.app, extension.context.org)
    setTimeout fn, 0
  _final


# Wraps the failure callback
# * Executes the failure behaviour defined by the current flavour
failureCbRunner = (isMain, errorFns, err, args...)->
  currentFlavour.failure(err)
  for errorFn in errorFns
    fn = _partial(errorFn, [err].concat(args)...)
    setTimeout fn, 0

require ['flavour', 'underscore', 'lib/utils/version'], (flavour, _, version)->
  _hull.version = version
  _extend = _.extend
  _partial = _.partial
  currentFlavour = flavour
  lock.unlock()

