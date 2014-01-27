define ()->
  utilsContainer = window
  utils: utilsContainer
  decode: (str)->
    utilsContainer.decodeURIComponent(utilsContainer.escape(utilsContainer.atob(str)))
  encode: (str)->
    utilsContainer.btoa(utilsContainer.unescape(utilsContainer.encodeURIComponent(str)))
  utilsContainer: window
