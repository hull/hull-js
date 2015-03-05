
module.exports = {
  decode: (str)->
    window.decodeURIComponent(window.escape(window.atob(str)))
  encode: (str)->
    window.btoa(window.unescape(window.encodeURIComponent(str)))
}
