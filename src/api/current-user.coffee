define ()->
  (emitter)->
    _currentUser = false
    emitter.on 'hull.init', (hull, me, app, org)->
      _currentUser = me
    emitter.on 'hull.auth.login', (me)->
      _currentUser = me
    emitter.on 'hull.auth.logout', ()->
      _currentUser = false
    ()-> _currentUser
