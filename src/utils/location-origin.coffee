
module.exports = ->
  return window.location.origin if window.location.origin
  port = ''
  port = ':' + window.location.port if window.location.port
  origin = window.location.protocol + "//" + window.location.hostname + port
  origin
