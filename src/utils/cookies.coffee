Cookies = require 'cookies-js'
COOKIES_ENABLED = 'COOKIES_ENABLED'
module.exports =
  set: Cookies.set
  get: Cookies.get
  remove: Cookies.expire
  enabled: ->
    (Cookies.set(COOKIES_ENABLED, 't') && Cookies.get(COOKIES_ENABLED) == 't')

