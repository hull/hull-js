ee = null
methods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit']

define ['eventemitter'], (EventEmitter2)->
  return ee if ee?
  ee = new EventEmitter2
    wildcard: true
    delimiter: '.'
    newListener: false
    maxListeners: 100
  emitter = {}
  emitter[method] = ee[method] for method in methods
  emitter
