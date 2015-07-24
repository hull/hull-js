Cookies = require 'cookies-js'
module.exports =
  set: Cookies.set
  get: Cookies.get
  remove: Cookies.expire

