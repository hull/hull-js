_pool = {}
_setup = null
_extend = null
currentFlavour = null

# Helpers to manage the calls to functions defined from the start
# event if they are not available
createPool = (name)->
  _pool[name]  = {} unless _pool[name]
  _p = _pool[name]
  (evt, params)->
    _p[evt] ?= []
    _p[evt].push params
deletePool = (name)->
  delete _pool[name]

preInit = (config, cb, errb)->
  throw 'Hull.init has already been called' if _setup

  # Prepare config
  config.namespace = 'hull'
  config.debug = config.debug && { enable: true }

  _setup = 
    config: config
    userSuccessFn: cb or ->
    userFailureFn: errb or ->

  bootstrap()

_hull = window.Hull =
  on:      createPool('events')
  track:   createPool('tracks')
  init:    preInit


# Wraps the success callback
# * Extends the global object
# * Reinjects events in the live app from the pool
# * Replays the track events
successCb = (args...)->
  extension = currentFlavour.success(args...)
  _hull = window.Hull = _extend(_hull, extension)
  # Prune callback queue
  for evt, cbArray of _pool['events']
    for cb of cbArray
      _hull.events.on evt, cb
  deletePool('events')

  # Prune init queue
  _setup.userSuccessFn(_hull)

  booted.track(evt, params) for evt, param of _pool['tracks']
  deletePool('tracks')

  _hull

# Wraps the failure callback
# * Executes the failure behaviour defined by the current flavour
failureCb = (args...)->
  currentFlavour.failure(args...)
  _setup.userFailureFn(args...)

bootstrap = ()->
  return unless _setup and currentFlavour
  currentFlavour.condition(_setup.config).then(successCb, failureCb)

require ['flavour', 'underscore', 'lib/utils/version'], (flavour, _, version)->
  _hull.version = version
  _extend = _.extend
  currentFlavour = flavour
  bootstrap()

