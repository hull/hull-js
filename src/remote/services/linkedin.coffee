GenericService    = require './generic_service'

class LinkedInService extends GenericService
  name : 'linkedin'
  path: 'linkedin'

  constructor: (config, gateway)-> super(config,gateway)

  request : (request,callback,errback)=>
    token = @getSettings().credentials?.token
    return errback('No Likedin User') unless token?

    {method, path, params} = request
    method = method.toLowerCase()
    return errback('Unable to perform non-GET requests on Likedin') unless method=='get'
    path   = path.substring(1) if (path[0] == "/")

    params = 
      url  : "https://api.linkedin.com/v1/#{path}"
      data : assign({}, params, {oauth2_access_token : token})
      error:   (err)-> errback(err.url)
      success: (response)=>
        callback
          provider: @name
          response: response.data
    @request_jsonp(params)

module.exports = LinkedInService
