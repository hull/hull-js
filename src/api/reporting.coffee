define ['underscore', 'lib/api/api'], (_, api) ->

  module =
    initialize: (app)->
      api.promise.then (apiObject) ->
        reporting = 

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
        app.core.reporting = reporting;

      true
