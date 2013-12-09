define ['underscore'], (_)->
  decode: (input, urlsafe)->
    input = input.replace(/\+/g, '-').replace(/\//g, '_') if urlsafe
    window.atob(input);
  encode: (str)->
    window.btoa(str).replace(/\+/g, '-').replace(/\//g, '_')
