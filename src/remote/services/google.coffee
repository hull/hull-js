assign       = require 'object-assign'
GenericService    = require './generic_service'

class GoogleService extends GenericService
  name : 'google'
  path: 'google'

  constructor: (config, gateway)-> super(config,gateway)

  request : (request,callback,errback)=>
    token = @getSettings().credentials?.token
    return errback('No Google+ User') unless token?

    {method, path, params} = request
    method = method.toLowerCase()
    return errback('Unable to perform non-GET requests on Google+') unless method=='get'
    path   = path.substring(1) if (path[0] == "/")

    params = 
      url  : "https://www.googleapis.com/plus/v1/#{path}"
      data : assign({}, params, {access_token : token})
      error:   (err)-> errback(err.url)
      success: (response)=>
        callback
          provider: @name
          response: response
    @request_jsonp(params)

module.exports = GoogleService
