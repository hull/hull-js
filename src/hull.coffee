define ['components/aura-express/lib/aura'], (Aura)->

  hull = null

  myApp = {
    name: 'myApp'
    afterAppStart: (env)->
      window.Hull = env.core.createSandbox()
  }

  try
    if window.opener && window.opener.Hull
      try
        window.opener.Hull.emit("hull.authComplete")
        return window.close()
      catch e
        console.warn("Error: " + e)
        # window.close()
  catch e2
    console.warn("Error: " + e2)

  (config)->
    return hull if hull && hull.app
    hull = { config }
    hull.app = Aura(config)
    hull.app
        .use('aura-extensions/aura-handlebars')
        .use('aura-extensions/aura-backbone')
        .use('lib/client/api')
        .use('lib/client/auth')
        .use('lib/client/widget')
        .use(myApp)
        .start({ widgets: 'body' })
    return hull


