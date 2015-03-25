_ = require '../../utils/lodash'
GenericShare = require './generic_share'

class WhatsappShare extends GenericShare
  constructor : (api, auth, currentUser, opts)->
    super(api, currentUser, 'facebook')

    @opts = opts
    @params = opts.params || {}

    t = "#{document.title} #{@params.url}"
    @params.text ||= t

    return @sharePopup()

  sharePopup: ->
    @_redirect('whatsapp://send', @opts, @params)

module.exports = WhatsappShare

