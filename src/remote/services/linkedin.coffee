define ['jquery-jsonp', 'underscore', 'lib/utils/promises'], (jsonp, _, promises)->
  initialize: (app)->
    app.core.routeHandlers.linkedin = (req, success, failure)->
      method = req.method.toLowerCase()
      token = app.core.credentials().linkedin?.token

      return failure('No linkedIn user') unless token
      #TODO Implement when the proxy is available
      return failure('Unable to perform non-GET requests on LinkedIn') unless method == 'get'

      request = jsonp
        url: "https://api.linkedin.com/v1/#{req.path}"
        callbackParameter: "callback"
        data: _.extend({}, req.params, { oauth2_access_token: token })
      request.done (response)->
        success({ response: response, provider: 'linkedin' })
      request.fail (req)->
        failure req.url
      return
