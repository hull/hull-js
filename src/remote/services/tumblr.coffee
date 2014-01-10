define ['lib/remote/services/proxy'], (proxy)->
  initialize: (app)->
    app.core.routeHandlers.tumblr = proxy { name: 'tumblr', path:  'tumblr/v2' }, app.core.handler
