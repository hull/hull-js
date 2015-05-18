superagent        = require 'superagent'
GenericService    = require './generic-service'
QSEncoder         = require '../../utils/query-string-encoder'

class HullAdminService extends GenericService
  name : 'hull'

  constructor: (config, gateway)->

  request: (request, callback, errback)->
    {method, path, params, organization} = request
    throw new Error('No organization defined') unless organization?

    method = method.toUpperCase()

    path   = path.substring(1) if (path[0] == "/")
    top_domain = document.location.host.split('.')
    top_domain.shift()
    top_domain = top_domain.join('.')
    protocol = document.location.protocol
    url  = "#{protocol}//#{organization}.#{top_domain}/api/v1/#{path}"

    headers = {}
    token = @getSettings()?.credentials?.access_token
    headers['AccessToken'] = token if token

    console.debug(url, method, params) if config?.debug?
    s = superagent(method, url).set(headers)

    if (method=='GET' and params?) then s.query(QSEncoder.encode(params)) else s.send(params)
    s.end (response)->
      return errback(response.body, response.error) if response.error
      callback
        provider: 'admin'
        body: response.body

module.exports = HullAdminService
