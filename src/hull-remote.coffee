define ['aura/aura', 'underscore', 'lib/utils/version'], (Aura, _, version)->

  availableServices = ['angellist', 'facebook', 'github', 'instagram', 'linkedin', 'soundcloud', 'tumblr', 'twitter']
  isAvailable = _.bind(_.contains, _, availableServices)

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug ?= false
    config.components = false
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    hull.app.use('lib/remote/handler')
    hull.app.use('lib/remote/current-user')
    hull.app.use('lib/remote/services/hull')

    keys = _.keys(config.settings?.auth || [])
    auth_services = _.filter keys, isAvailable

    _.each auth_services, (value) ->
      hull.app.use "lib/remote/services/#{value}"

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
