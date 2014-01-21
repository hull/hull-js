#global define:true
define ['handlebars', 'lib/utils/handlebars-helpers'], (Handlebars, helpers)->
  instance = Handlebars.default.create()
  instance.registerHelper(k, v) for k,v of helpers
  instance
