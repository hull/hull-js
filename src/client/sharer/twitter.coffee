GenericShare = require './generic_share'

class TwitterShare extends GenericShare
  defaultMethod: 'share'

  constructor : (api, currentUser, opts)->
    super(api, currentUser, 'facebook')

    @opts   = opts
    @params = opts.params

    # if @opts.method=='share'
    # Parameter name already is url. No need to touch

    return @sharePopup()

  sharePopup : ()->
    # opts.method ||= 'statuses/update'
    [@opts.width, @opts.height] = [550, 420]
    @_popup("https://twitter.com/intent/tweet", @opts)

module.exports = TwitterShare
