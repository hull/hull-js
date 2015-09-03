Cookies = require 'cookies-js'
COOKIES_ENABLED = '_ce'
module.exports =
  set: Cookies.set
  get: Cookies.get
  remove: Cookies.expire
  enabled: ->
    val = new Date().getTime().toString()
    ((Cookies.set(COOKIES_ENABLED, val) && Cookies.get(COOKIES_ENABLED) == val))

