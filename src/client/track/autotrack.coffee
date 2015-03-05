module.exports = (headers, emitter)->
  hullTrack = headers['Hull-Track']
  if hullTrack
    try
      [eventName, trackParams] = JSON.parse(atob(hullTrack))
      emitter.emit(eventName, trackParams)
    catch error
      false
