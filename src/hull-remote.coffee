define ['aura/aura', 'lib/utils/version'], (Aura, version)->

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug ?= false
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    hull.app.use('lib/remote/services/hull')

    hull.app.use('lib/remote/services/facebook') if config?.services?.settings?.facebook_app?.appId

    services = ['github', 'twitter', 'instagram', 'soundcloud', 'angellist']
    _.each services, (value, index) ->
      hull.app.use "lib/remote/services/#{value}" if config?.services?.settings?["#{value}_app"]

    if config.services.settings.tumblr_app
      hull.app.use('lib/remote/services/tumblr')

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
