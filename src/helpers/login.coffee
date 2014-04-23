define ->
  update: (model, mediator, attributes={})->
    return unless model
    attributes._id = 'me'
    model('me').set(attributes)
  login: (model, mediator, attributes={})->
    return unless model
    attributes._id = 'me'
    model('me').clear(silent: true)
    model('me').set(attributes)
  logout: (model, mediator)->
    return unless model
    model('me').clear()
    model('me').set({_id: 'me'}, {silent: true})

