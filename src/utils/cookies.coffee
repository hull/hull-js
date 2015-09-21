Cookies = require 'cookies-js'
COOKIES_ENABLED = '_ce'
module.exports =
  set: Cookies.set
  get: Cookies.get
  remove: Cookies.expire
  enabled: -> Cookies._areEnabled()

