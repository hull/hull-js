ee = null
methods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners']

define ['eventemitter'], (EventEmitter2)->
  return ee if ee?
  _ee = new EventEmitter2
    wildcard: true
    delimiter: '.'
    newListener: false
    maxListeners: 100
  ee = {}
  ee[method] = _ee[method] for method in methods
  ee
