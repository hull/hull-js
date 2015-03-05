GenericShare = require './generic_share'

class TwitterShare extends GenericShare
  defaultMethod: 'share'

  constructor : (api, currentUser, opts)->
    super(api, currentUser, 'facebook')

    @opts   = opts
    @params = opts.params
    @params.url   ||= @getDefaultUrl() if @opts.method=='share'

    return @sharePopup()

  sharePopup : ()->
    # opts.method ||= 'statuses/update'
    [@opts.width, @opts.height] = [550, 420]
    @_popup("https://twitter.com/intent/tweet", @opts)

module.exports = TwitterShare
