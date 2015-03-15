assign   = require 'object-assign'
_        = require '../../utils/lodash'
promises = require '../../utils/promises'

to_qs = (params)->
  _.map params, (v,k) ->
    encodeURIComponent(k)+'='+encodeURIComponent(v)
  .join('&')

class GenericShare
  constructor: (api, auth, currentUser, provider, opts)->
    @api = api
    @opts = opts
    @auth = auth
    @provider = provider
    @currentUser = currentUser

  _ensureLogin: =>
    # We can't have strategy==redirect when wanting a promise...
    loginParams = assign(_.omit(@opts,'params','method'), {provider:@provider,strategy:'popup'})
    @auth.login(loginParams)

  _popup : (location, opts)->
    querystring = to_qs(opts.params)
    share = window.open("#{location}?#{querystring}", 'hull_share', "location=0,status=0,width=#{opts.width},height=#{opts.height}")
    dfd = promises.deferred()
    interval = setInterval ()->
      try
        if share == null || share.closed
          window.clearInterval(interval)
          dfd.resolve({display:"popup"})
       catch e
        1 == 1
    , 500
    return dfd.promise

module.exports = GenericShare
