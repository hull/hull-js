enabled = false
verbose = false

log = (args...)->
  # TODO : 
  # Dont use spread if we want IE8: It doesnt' treat console.log as a real function hence can't do console.log.apply.
  # Duh...
  console.log(args...)

error = (args...)->
  # TODO : 
  # Dont use spread if we want IE8: It doesnt' treat console.log as a real function hence can't do console.log.apply.
  # Duh...
  console.error(args...)

module.exports = {
  enabled: ()->
    return !!enabled
  init: (debug)->
    enabled = !!debug.enabled
    verbose = !!debug.verbose
  log: (args...)->
    log(args...) if enabled
  info: (args...)->
    log(args...) if enabled
  verbose: (args...)->
    log(args...) if enabled and verbose
  warn: (args...)->
    log(args...)
  error: error
}
