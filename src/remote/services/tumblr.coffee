GenericService    = require './generic-service'

class TumblrService extends GenericService
  name : 'twitter'
  path: 'tumblr/v2'
  constructor: (config, gateway)->
    super(config,gateway)
    @request = @wrappedRequest

module.exports = TumblrService
