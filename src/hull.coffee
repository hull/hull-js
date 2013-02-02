define ['aura/aura', 'lib/hullbase'], (Aura, HullDef)->

  hull = null

  myApp = {
    name: 'Hull'
    afterAppStart: (env)->
      sb = env.core.createSandbox();
      Hull = _.extend(HullDef, sb);
      Hull.me     = sb.data.api.model('me');
      Hull.app    = sb.data.api.model('app');
      Hull.org    = sb.data.api.model('org');
  }

  if window.opener && window.opener.Hull
    try
      window.opener.Hull.emit("hull.authComplete")
      return window.close()
    catch e
      console.warn("Error: " + e)

  (config)->
    return hull if hull && hull.app
    hull = { config }
    config.namespace = "hull"
    hull.app = Aura(config)
    initProcess = hull.app
        .use('aura-extensions/aura-handlebars')
        .use('aura-extensions/aura-backbone')
        .use('aura-extensions/hull-utils')
        .use('lib/client/handlebars-helpers')
        .use('lib/client/api')
        .use('lib/client/auth')
        .use('lib/client/templates')
        .use('lib/client/widget')
        .use(myApp)
        .start({ widgets: 'body' })

    initProcess.fail (err)->
      throw err
    return hull


