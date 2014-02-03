define ()->
  class UserManager
    constructor: (userDesc=null, userCreds={}, updater)->
      @currentUser = userDesc
      @currentSettings = userCreds
      @updater = updater

    loggedIn: -> @currentUser?
    is: (userId)-> @currentUser?.id == userId
    updateDescription: ()->
      @updater.handle({ url: 'me', nocallback: true })
    updateSettings: ()->
      @updater.handle({ url: 'app/settings', nocallback: true })
  initialize: (app)->
    userManager = new UserManager(app.config.data.me, app.config.settings, app.core.handler)
    app.core.handler.after (h)->
      userId = h.headers['Hull-User-Id']
      unless userManager.is(userId) # It changed
        delete app.core.handler.headers['Hull-Access-Token']
        p1 = userManager.updateDescription().then (h)->
          userManager.currentUser = h.response
          app.sandbox.emit 'remote.user.update', h.response
        , (err)->
          userManager.currentUser = {}
          app.sandbox.emit 'remote.user.update', {}
        p2 = p1.then userManager.updateSettings().then((h)->
          userManager.currentSettings = h.response
          app.sandbox.emit 'remote.settings.update', h.response
        , (err)->
          userManager.currentSettings = {}
          app.sandbox.emit 'remote.settings.update', {}
        )
        p2

    app.core.currentUser = -> JSON.parse(JSON.stringify(userManager.userDesc)) #TODO Seriously use lodash
    app.core.settings = -> JSON.parse(JSON.stringify(userManager.currentSettings)) #TODO Seriously use lodash

