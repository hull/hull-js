define ->
  login: (model, mediator)->
    return unless model
    model('me').fetch().then (me)->
      mediator.emit 'hull.login', me
    , (err)->
      mediator.emit 'hull.login.failure', err
  logout: (model, mediator)->
    return unless model
    mediator.emit 'hull.logout'
    model('me').clear()

