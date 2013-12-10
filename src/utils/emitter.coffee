methods = ['on', 'onAny', 'offAny', 'once', 'many', 'off', 'removeAllListeners', 'listeners', 'listenersAny', 'emit', 'setMaxListeners']

define ['underscore', 'eventemitter'], (_, EventEmitter2)->
  _ee = new EventEmitter2
    wildcard: true
    delimiter: '.'
    newListener: false
    maxListeners: 100
  ee = {}
  ee[method] = _.bind(_ee[method], _ee) for method in methods
  ee
