GenericService    = require './generic_service'

class TwitterService extends GenericService
  name : 'twitter'
  path: 'twitter/1.1'
  constructor: (config, gateway)->
    super(config,gateway)
    @request = @wrappedRequest

module.exports = TwitterService
