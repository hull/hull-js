module.exports = (opts={},callback)->
  src = opts.src;
  document = opts.document || window.document
  sc = document.createElement "script"
  sc.src = src
  sc.onload = callback
  document.getElementsByTagName("head")[0].appendChild(sc)
