define ->

  freeze = Object.freeze || ->

  init: (env)->
    return unless env.config.services.types.storage?.length > 0
    env.sandbox.data.storage_policy = env.config.services.settings.s3_storage



