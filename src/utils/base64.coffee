define ['underscore'], (_)->
  decode: (input, urlsafe)->
    input = input.replace(/\+/g, '-').replace(/\//g, '_') if urlsafe
    window.atob(input);
  encode: (str)->
    ret = window.btoa(input, urlsafe);
    ret.replace(/\+/g, '-').replace(/\//g, '_') if urlsafe
    ret
