queuedEvents = {}
queuedTracks = {}
initConfig = null
userSuccessFn = ->
userFailureFn = ->
currentFlavour = null
_extend = null

preInit = (config, cb, errb)->
  throw 'Hull.init has already been called' if initConfig

  # Prepare config
  config.namespace = 'hull'
  config.debug = config.debug && { enable: true }
  initConfig = config
  userSuccessFn = cb if cb
  userFailureFn = errb if errb

  bootstrap() if currentFlavour

# Pools the calls made to Hull.on before init
preInitOn = (evt, fn)->
  queuedEvents[evt] ?= []
  queuedEvents[evt].push fn

# Pools the calls made to Hull.track before init
preInitTrack = (evtName, params)->
  queuedTracks[evt] ?= []
  queuedTracks[evt].push params

_hull = window.Hull =
  on:      preInitOn
  track:   preInitTrack
  init:    preInit


# Wraps the success callback
# * Reinjects events in the live app from the pool
# * Replays the track events
buildSuccessCb = (flavourSuccessFn, userSuccessFn)->
  (args...)->
    extension = flavourSuccessFn(args...)
    _hull = window.Hull = _extend(_hull, extension)
    # Prune callback queue
    for evt, cbArray of queuedEvents
      for cb of cbArray
        _hull.events.on evt, cb
    queuedEvents = []

    # Prune init queue
    userSuccessFn(_hull)

    booted.track(evt, params) for evt, param of queuedTracks
    queuedTracks = []

    _hull

# Wraps the failure callback
# * Executes the failure behaviour defined by the current flavour
buildFailureCb = (flavourFailureFn, userFailureFn)->
  (args...)->
    flavourFailureFn(args...)
    userFailureFn(args...)

bootstrap = ()->
  success = buildSuccessCb(currentFlavour.success, userSuccessFn)
  failure = buildFailureCb(currentFlavour.failure, userFailureFn)
  currentFlavour.condition(initConfig).then(success, failure)

require ['flavour', 'underscore', 'lib/utils/version'], (flavour, _, version)->
  _hull.version = version
  _extend = _.extend
  currentFlavour = flavour
  bootstrap(initConfig) if initConfig

