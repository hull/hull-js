define ->
  parseQueryString = (str)->
    str ||= window.location.search
    objURL = {}
    str.replace(
      new RegExp( "([^?=&]+)(=([^&]*))?", "g" )
      ( $0, $1, $2, $3 )-> objURL[ $1 ] = decodeURIComponent($3)
    )
    return objURL

  initialize: (app)->
    console.warn("Init eneity ext")
    return if app.config.uid
    util = app.core.util
    og = $('meta[property="og:url"]');
    if (og && og.length && og.attr('content'))
      uid = og.attr('content')
    else
      loc = document.location
      search = parseQueryString(loc.search)
      qs = _.map(_.keys(search).sort(), (k)-> [k, search[k]].join("=")).join('&')
      qs = "?#{qs}" if qs.length > 0
      uid = [
        loc.origin,
        loc.pathname,
        qs
      ].join('')
    app.config.uid = "~#{util.base64.encode(uid, true)}"


