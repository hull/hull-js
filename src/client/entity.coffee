define ['underscore'], (_)->
  parseQueryString = (str)->
    str ||= window.location.search
    objURL = {}
    str.replace(
      new RegExp( "([^?=&]+)(=([^&]*))?", "g" )
      ( $0, $1, $2, $3 )-> objURL[ $1 ] = decodeURIComponent($3)
    )
    return objURL

  initialize: (app)->
    return if app.config.uid
    util = app.core.util

    util.entity =
      decode: (str)->
        if /^~[a-z0-9_\-\+\/\=]+$/i.test(str) && (str.length - 1) % 4 == 0
          util.base64.decode(str.substr(1), true)
        else
          str
      encode: (str)->
        "~#{util.base64.encode(str, true)}"

    if app.config.withEntity == true
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
      app.config.uid = util.entity.encode(uid)
