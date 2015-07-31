_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
cookies  = require '../utils/cookies'
Base64   = require '../utils/base64'
clone    = require '../utils/clone'

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
    @clear()

  get: (field) =>
    if field? and @me then clone(@me[field]) else clone(@me)

  clear: ()=>
    @me = null

  hasIdentity : (identity)=>
    return false unless identity?
    identities = @me?.identities
    identity = identity.toLowerCase()
    return false unless identities and identity
    _.some identities, (i) -> i.provider.toLowerCase()==identity

  # We force create and emit a user.
  setLoginStatus : (me, provider)=>
    @me = me
    EventBus.emit('hull.user.create', me) unless me?.stats?.sign_in_count?
    EventBus.emit('hull.user.login',  me, provider)

  init : (me)=>
    # Init is silent
    @me = me

  set : (me) =>
    prevUpdatedAt = @me?.updated_at
    prevId = @me?.id

    # Silently update now
    @me = me

    # User was updated. Emit Update
    if prevUpdatedAt != me?.updated_at
      EventBus.emit('hull.user.update',  me)
    if me?.id
      # We have a user
      # User changed. Do the full update.
      if prevId != me.id
        @setLoginStatus(me)
    else
      # We have no user anymore
      # Emit logout event
      if prevId
        EventBus.emit('hull.user.logout')

    me

  setCookies : (headers={}, appId)->
    cookieName = "hull_#{appId}"
    if headers && headers['Hull-User-Id'] && headers['Hull-User-Sig']
      val = Base64.encode(JSON.stringify(headers))
      @signature = val
      fixCookies(val)
      cookies.set(cookieName, val, path: "/")
    else
      @signature = false
      cookies.remove(cookieName, path: "/")


module.exports = CurrentUser
