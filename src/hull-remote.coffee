define ['aura/aura', 'lib/version'], (Aura, version)->

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug = true
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    hull.app.use('lib/remote/services/hull')

    if config.services.settings.facebook_app
      hull.app.use('lib/remote/services/facebook')

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
