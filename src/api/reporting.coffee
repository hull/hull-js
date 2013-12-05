define ['underscore'], (_) ->

  init: (apiObject)->
    track: (eventName, params) ->
      data = _.extend
        url: window.location.href
        referrer: document.referrer
      ,params

      apiObject.api
        provider: "track"
        path: eventName
      , 'post', data

    flag: (id) ->
      apiObject.api
        provider: "hull"
        path: [id, 'flag'].join('/')
      ,'post'

      #TODO, make an extension from this
      # app.core.reporting = reporting;

