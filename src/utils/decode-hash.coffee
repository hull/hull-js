Base64   = require '../utils/base64'
module.exports = ()->
  try
    h = document.location.hash.replace('#', '')
    hash = JSON.parse(Base64.decode(h)) if !!h
  catch e
    hash = null
  return hash
