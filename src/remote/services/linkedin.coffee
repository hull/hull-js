define ['jquery', 'underscore', 'lib/utils/promises'], ($, _, promises)->
  initialize: (app)->
    app.core.routeHandlers.linkedin = (req, success, failure)->
      method = req.method.toLowerCase()

      #TODO Implement when the proxy is available
      return failure('Unable to perform non-GET requests on LinkedIn') unless method == 'get'

      request = $.ajax
        dataType: 'jsonp'
        url: "https://api.linkedin.com/v1/#{req.path}"
        data: _.extend({}, req.params, { oauth2_access_token: app.core.credentials().linkedin.token })
      request.done (response)->
        success({ response: response, provider: 'linkedin' })
      request.fail failure
      return
