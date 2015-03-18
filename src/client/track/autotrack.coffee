Base64 = require('js-base64').Base64

module.exports = (headers, emitter)->
  hullTrack = headers['Hull-Track']
  if hullTrack
    try
      [eventName, trackParams] = JSON.parse(Base64.atob(hullTrack))
      emitter.emit(eventName, trackParams)
    catch error
      false
