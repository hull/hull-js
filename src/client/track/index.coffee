assign = require 'object-assign'

class Tracker
  constructor : (api)->
    @api = api
  track : (event,params)=>
    # Enrich Data before sending
    data = assign {url:window.location.href,referrer:document.referrer}, params
    @api.message
      provider:'track'
      path: event
    , 'post', data

module.exports = Tracker
