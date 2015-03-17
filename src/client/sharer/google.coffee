GenericShare = require './generic_share'

class GoogleShare extends GenericShare
  defaultMethod: 'share'

  constructor : (api, auth, currentUser, opts)->
    super(api, currentUser, 'google')

    @opts   = opts
    @params = opts.params || {}
    @opts.method   ||= @defaultMethod

    # if @opts.method=='share'
    # Parameter name already is url. No need to touch

    return @sharePopup()

  sharePopup : ()->
    # opts.method ||= 'statuses/update'
    [@opts.width, @opts.height] = [550, 420]

    @_popup("https://plus.google.com/#{@opts.method}", @opts, @params)

module.exports = GoogleShare
