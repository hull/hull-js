queuedEvents = {}
queuedTracks = {}
userSuccessCb = null
userFailureCb = null
initialized = false

# Pools the calls made to Hull.on
preInitOn = (evt, fn)->
  queuedEvents[evt] ?= []
  queuedEvents[evt].push fn

# Pools the calls made to Hull.track
preInitTrack = (evtName, params)->
  queuedTracks[evt] ?= []
  queuedTracks[evt].push params

# Wraps the success callback
# * Reinjects events in the live app from the pool
# * Replays the track events
buildSuccessCb = (flavourSuccessFn)->
  (args...)->
    booted = flavourSuccessFn(args...)
    # Prune callback queue
    for evt, cbArray of queuedEvents
      for cb of cbArray
        booted.events.on evt, cb
    queuedEvents = []

    # Prune init queue
    userSuccessCb(booted)
    userSuccessCb = undefined

    booted.track(evt, params) for evt, param of queuedTracks
    queuedTracks = []

    booted

# Wraps the failure callback
# * Executes the failure behaviour defined by the current flavour
buildFailureCb = (flavourFailureCb)->
  (args...)->
    flavourFailureCb(args)
    flavourFailureCb = undefined
    userFailureCb(args...)

define ['./utils/version'], (version)->

  (condition, flavourSuccess, flavourFailure)->
    init = (config, cb, errb)->
      throw 'Hull.init has already been called' if initialized
      initialized = true
      userSuccessCb = cb
      userFailureCb = errb

      # Prepare config
      config.namespace = 'hull'
      config.debug = config.debug && { enable: true }

      condition(config).then(buildSuccessCb(flavourSuccess), buildFailureCb(flavourFailure))

    {
      on:      preInitOn
      track:   preInitTrack
      version: version
      init:    init
    }

