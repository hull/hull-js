Base64 = require './base64.js'

module.exports =
  decode: (input)->
    unless /^~[a-z0-9_\-\+\/\=]+$/i.test(input)
      throw "'#{input}' cannot be decoded because it has not been correctly encoded"

    Base64.decodeURL(input.substr(1))

  encode: (input)->
    "~#{Base64.encodeURL(input)}"
