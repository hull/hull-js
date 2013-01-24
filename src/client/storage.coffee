define ->

  freeze = Object.freeze || ->

  config:
    require:
      paths:
        'jquery.fileupload' : 'jquery-file-upload/js/jquery.fileupload'
        'jquery.ui.widget'  : 'jquery-file-upload/js/vendor/jquery.ui.widget'


  init: (env)->
    return unless env.config.services.types.storage?.length > 0
    env.sandbox.data.storage_policy = env.config.services.settings.s3_storage



