define ['aura/aura', 'lib/version'], (Aura, version)->

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug ?= false
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    hull.app.use('lib/remote/services/hull')

    if config.services.settings.facebook_app
      hull.app.use('lib/remote/services/facebook')

    if config.services.settings.github_app
      hull.app.use('lib/remote/services/github')

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
