define ->
  initialize: (app)->
    return if app.config.uid
    util = app.core.util
    og = $('meta[property="og:url"]');
    if (og && og.length && og.attr('content'))
      uid = og.attr('content')
    else
      loc = document.location
      uid = [
        loc.origin,
        loc.pathname,
        loc.search
      ].join('')
    app.config.uid = "~#{util.base64.encode(uid, true)}"


