define ['underscore'], (_) ->
  reporter = undefined
  init: (apiObject)->
    throw new Error('Can not call init twice') if reporter
    throw new ReferenceError('No API adapter provided') unless apiObject
    reporter =
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
    reporter
  get: ()->
    throw new Error('Not initialized yet') unless reporter
    reporter
