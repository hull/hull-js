define ['lib/remote/services/proxy'], (proxy)->
  initialize: (app)->
    app.core.routeHandlers.soundcloud = proxy { name: 'soundcloud', path:  'soundcloud' }, app.core.handler
