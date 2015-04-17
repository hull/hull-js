assign            = require '../../polyfills/assign'
GenericService    = require './generic_service'

class AngelListService  extends GenericService
  name : 'angellist'
  path : 'angellist'
  constructor: (config, gateway)->

  request: (request, callback, errback)->
    {method, path, params} = request
    method = method.toLowerCase()
    return errback('Unable to perform non-GET requests on AngelList') unless method=='get'

    token = RemoteConfigStore.getSettings()
    path   = path.substring(1) if (path[0] == "/")

    params = 
      url  : "https://api.linkedin.com/v1/#{path}"
      data : assign({}, params, {access_token : @token.access_token})
      error:   (err)-> errback(err.url)
      success: (response)->
        callback
          response: response.data
          provider: @name
    @request_jsonp(params)


module.exports = AngelListService
