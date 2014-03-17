define ()->
  (emitter)->
    _currentUser = false
    emitter.on 'hull.init', (hull, me, app, org)->
      _currentUser = me
    emitter.on 'hull.auth.login', (me)->
      _currentUser = me
    emitter.on 'hull.user.update', (me)->
      unless currentUser?.id
        if me.id
          emitter.emit 'hull.auth.login', me
      else
        if _currentUser.id == me.id
          _currentUser = me
        else unless me?.id
          emitter.emit 'hull.auth.logout'
        else
          emitter.emit 'hull.auth.login', me
    emitter.on 'hull.auth.logout', ()->
      _currentUser = false
    ()-> _currentUser
