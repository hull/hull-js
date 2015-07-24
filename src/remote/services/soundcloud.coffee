GenericService    = require './generic-service'

class SoundCloudService extends GenericService
  name : 'soundcloud'
  path: 'soundcloud'
  constructor: (config, gateway)->
    super(config,gateway)
    @request = @wrappedRequest

module.exports = SoundCloudService
