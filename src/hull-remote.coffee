define ['components/aura-express/lib/aura'], (Aura)->

  hull = null

  Hull = (config)->
    return hull if hull && hull.app
    hull = { config }
    config.debug = true
    hull.app = Aura(config)
    hull.app.use('lib/remote/services')
    for serviceName, serviceConfig of config.services
      hull.app.use("lib/remote/services/#{serviceName}-service")

    hull.app.start()

    return hull

  window.Hull = Hull
  Hull
