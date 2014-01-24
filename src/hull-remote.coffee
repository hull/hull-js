define ['aura/aura', 'underscore', 'lib/utils/version'], (Aura, _, version)->

  unavailableServices = ['linkedin']
  containsUnavailable = _.bind(_.contains, _, unavailableServices)

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
    auth_services = _.reject keys, containsUnavailable

    _.each auth_services, (value) ->
      hull.app.use "lib/remote/services/#{value}"

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull.version = version
  Hull
