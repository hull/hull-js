_        = require '../../utils/lodash'
promises = require '../../utils/promises'
track    = require '../track/index'

FacebookShare = require './facebook'
TwitterShare = require './twitter'

class Sharer
  constructor : (api, auth, currentUser)->
    @api = api
    @auth = auth
    @currentUser = currentUser
    @track=track

  share: (opts)=>
    if !_.isObject(opts)
      throw new Error("You need to pass an options hash to the share method. You passed: #{JSON.stringify(opts)}")
    else if !opts.provider?
      throw new Error("You need specify the provider on which to share. You passed: #{opts.provider}")
    else if !_.isObject(opts.params)
      throw new Error("You need specify some parameters to pass the provider. You passed: #{opts.params}")
     

    sharePromise = switch opts.provider
      when 'facebook' then new FacebookShare(@api, @auth, @currentUser, opts)
      when 'twitter'  then new twitterShare(@api, @auth, @currentUser, opts)

    params = opts.params

    sharePromise.then (response)=>
      EventBus.emit("hull.#{opts.provider}.share", {params,response})
      response
    , (err)-> throw err

module.exports = Sharer

