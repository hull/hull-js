Base64 = require('js-base64').Base64

module.exports = {
  decode: (str)->
    if /^~[a-z0-9_\-\+\/\=]+$/i.test(str) && (str.length - 1) % 4 == 0
      Base64.decode(str.substr(1), true)
    else
      str
  encode: (str)->
    "~#{Base64.encodeURI(str, true)}"
}
