define ->
  login: (model, mediator)->
    return unless model
    model('me').fetch()
  logout: (model, mediator)->
    return unless model
    model('me').clear()

