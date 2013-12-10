define ()->
  decode: (str)->
    decodeURIComponent(escape(window.atob(str)))
  encode: (str)->
    window.btoa(unescape(encodeURIComponent(str)))
