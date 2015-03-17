GenericShare = require './generic_share'

class TwitterShare extends GenericShare
  defaultMethod: 'tweet'

  constructor : (api, auth, currentUser, opts)->
    super(api, currentUser, 'twitter')

    @opts   = opts
    @params = opts.params || {}
    @opts.method   ||= @defaultMethod

    @params.source ||= api.remoteConfig.data.app.name

    # Parameter name already is url. No need to touch

    return @sharePopup()

  sharePopup : ()->
    # opts.method ||= 'statuses/update'
    [@opts.width, @opts.height] = [550, 420]
    @params.mini = true
    @_popup("https://www.linkedin.com/shareArticle", @opts, @params)

module.exports = TwitterShare
