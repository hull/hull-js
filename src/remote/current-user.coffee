define ()->
  class UserManager
    constructor: (userDesc=null, userCreds={}, updater)->
      @currentUser = userDesc
      @currentCredentials = userCreds
      @updater = updater

    loggedIn: -> @currentUser?
    is: (userId)-> @currentUser?.id == userId
    updateDescription: ()->
      @updater.handle({ url: 'me', nocallback: true })
    updateCredentials: ()->
      @updater.handle({ url: 'me/credentials', nocallback: true })
  initialize: (app)->
    userManager = new UserManager(app.config.data.me, app.config.data.credentials, app.core.handler)
    app.core.handler.after (h)->
      userId = h.headers['Hull-User-Id']
      unless userManager.is(userId) # It changed
        userManager.updateDescription().then (h)->
          userManager.currentUser = h.response
          app.sandbox.emit 'hull.user.update', h.response
        , (err)->
          userManager.currentUser = {}
          app.sandbox.emit 'hull.user.update', {}
        userManager.updateCredentials().then (h)->
          userManager.currentCredentials = h.response
        , (err)->
          userManager.currentCredentials = {}

    app.core.currentUser = -> JSON.parse(JSON.stringify(userManager.userDesc)) #TODO Seriously use lodash
    app.core.credentials = -> JSON.parse(JSON.stringify(userManager.currentCredentials)) #TODO Seriously use lodash

