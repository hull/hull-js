define ['aura/aura', 'lib/utils/version'], (Aura, version)->

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug ?= false
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    hull.app.use('lib/remote/services/hull')

    if config.services.settings.facebook_app?.appId
      hull.app.use('lib/remote/services/facebook')

    if config.services.settings.github_app
      hull.app.use('lib/remote/services/github')

    if config.services.settings.twitter_app
      hull.app.use('lib/remote/services/twitter')

    if config.services.settings.instagram_app
      hull.app.use('lib/remote/services/instagram')

    if config.services.settings.angellist_app
      hull.app.use('lib/remote/services/angellist')

    if config.services.settings.tumblr_app
      hull.app.use('lib/remote/services/tumblr')

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
