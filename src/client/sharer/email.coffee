_            = require '../../utils/lodash'
GenericShare = require './generic_share'

class EmailShare extends GenericShare
  constructor : (api, auth, currentUser, opts)->
    super(api, currentUser, 'facebook')

    @opts   = opts
    @params = opts.params || {}

    @params.body ||= @params.url

    return @sharePopup()

  sharePopup : ()->
    @_redirect("mailto:", @opts, @params)

module.exports = EmailShare
