define ['lib/remote/services/proxy'], (proxy)->
  initialize: (app)->
    app.core.routeHandlers.twitter = proxy { name: 'twitter', path: 'twitter/1.1' }, app.core.handler
