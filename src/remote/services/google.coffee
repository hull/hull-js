define ['jquery-jsonp', 'underscore'], (jsonp, _)->
  initialize: (app)->
    app.core.routeHandlers.google = (req, success, failure)->
      method = req.method.toLowerCase()
      token = app.core.settings().auth?.google?.credentials?.token

      return failure('No Google+ user') unless token
      #TODO Implement when the proxy is available
      return failure('Unable to perform non-GET requests on Google+ API') unless method == 'get'

      request = jsonp
        url:  "https://www.googleapis.com/plus/v1/#{req.path}"
        callbackParameter: "callback"
        data: _.extend({}, req.params, { access_token: token })
      request.done (response)->
        success({ response: response, provider: 'google' })
      request.fail (req)->
        failure req.url
      return
