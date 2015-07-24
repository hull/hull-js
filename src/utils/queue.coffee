Queue = ()->
  _open = false
  _cbs = []
  run: (cb)->
    if _open
      cb()
    else
      _cbs.push cb
  flush: ()->
    _open = true
    cb() for cb in _cbs
module.exports = Queue
