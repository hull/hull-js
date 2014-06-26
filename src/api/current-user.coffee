define ()->
  (emitter)->
    _currentUser = null
    emitter.on 'hull.init', (hull, me, app, org)->
      _currentUser = me
    emitter.on 'hull.auth.login', (me)->
      _currentUser = me
    emitter.on 'hull.auth.update', (me)->
      if _currentUser?.id
        if _currentUser.id == me.id
          _currentUser = me
        else unless me?.id
          emitter.emit 'hull.auth.logout'
        else
          emitter.emit 'hull.auth.login', me
    emitter.on 'hull.auth.logout', ()->
      _currentUser = null
    ()-> _currentUser
