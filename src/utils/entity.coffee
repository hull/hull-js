base64 = require './base64'

module.exports = {
  decode: (str)->
    if /^~[a-z0-9_\-\+\/\=]+$/i.test(str) && (str.length - 1) % 4 == 0
      base64.decode(str.substr(1), true)
    else
      str
  encode: (str)->
    "~#{base64.encode(str, true)}"
}
