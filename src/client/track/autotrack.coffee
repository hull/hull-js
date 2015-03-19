Base64 = require '../../utils/base64'

module.exports = (headers, emitter)->
  hullTrack = headers['Hull-Track']
  if hullTrack
    try
      [eventName, trackParams] = JSON.parse(Base64.decode(hullTrack))
      emitter.emit(eventName, trackParams)
    catch error
      false
