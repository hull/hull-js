assign       = require '../../polyfills/assign'
GenericService    = require './generic_service'

class InstagramService extends GenericService
  name : 'instagram'
  path: 'instagram'

  constructor: (config, gateway)-> super(config,gateway)

  request : (request,callback,errback)=>
    config = @getSettings()
    return errback('No Likedin User') unless token?

    {method, path, params} = request
    method = method.toLowerCase()
    path   = path.substring(1) if (path[0] == "/")
    if method != 'get'
      return @wrappedRequest(request, callback, errback)
    else
      params = 
        url  : "https://api.instagram.com/v1/#{path}"
        data : assign({}, params, config)
        error:   (err)-> errback(err.url)
        success: (response)->
          callback
            provider: @name
            response: response.data
            headers: 
              pagination: response.pagination
              meta: response.meta
      @request_jsonp(params)

module.exports = InstagramService
