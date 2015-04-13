_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
cookies  = require '../utils/cookies'
Base64   = require '../utils/base64'

# Fix for http://www.hull.io/docs/users/backend on browsers where 3rd party cookies disabled
fixCookies = (userSig)->
  try
    if window.jQuery && _.isFunction(window.jQuery.fn.ajaxSend)
        window.jQuery(document).ajaxSend (e, xhr, opts)->
          if userSig && !opts.crossDomain
            xhr.setRequestHeader('Hull-User-Sig', userSig)
  catch e


class CurrentUser

  constructor: ->
    @currentUser = null

  get: (field) =>
    if @currentUser
      returned = if field? then @currentUser[field] else @currentUser
      JSON.parse(JSON.stringify(returned))

  getId: ->
    @currentUser && @currentUser.id

  hasIdentity : (identity)=>
    return false unless identity?
    identities = @currentUser?.identities
    identity = identity.toLowerCase()
    return false unless identities and identity
    _.some identities, (i) -> i.provider.toLowerCase()==identity

  # We force create and emit a user.
  updateLoginStatus : (me, provider)=>
    @currentUser = me
    EventBus.emit('hull.user.create', me) unless me?.stats?.sign_in_count?
    EventBus.emit('hull.user.login',  me, provider)

  init : (me)=>
    # Init is silent
    @currentUser = me

  update : (me) =>
    prevUpdatedAt = @currentUser?.updated_at
    prevId = @currentUser?.id

    # Silently update now
    @currentUser = me

    # User was updated. Emit Update
    EventBus.emit('hull.user.update',  me) if prevUpdatedAt != me?.updated_at

    if me?.id?
      # We have a user
      # User changed. Do the full update.
      if prevId != me.id
        @updateLoginStatus(me)
    else
      # We have no user anymore
      # Emit logout event
      if prevId
        EventBus.emit('hull.user.logout')

    me

  updateCookies : (headers={}, appId)->
    cookieName = "hull_#{appId}"
    if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
      val = Base64.encode(JSON.stringify(headers))
      @currentUserSignature = val
      fixCookies(val)
      cookies.set(cookieName, val, path: "/")
    else
      @currentUserSignature = false
      cookies.remove(cookieName, path: "/")


module.exports = CurrentUser
