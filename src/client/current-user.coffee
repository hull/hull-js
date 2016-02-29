_        = require '../utils/lodash'
EventBus = require '../utils/eventbus'
cookies  = require '../utils/cookies'
Base64   = require '../utils/base64'
clone    = require '../utils/clone'
getKey   = require '../utils/get-key'
Raven    = require '../utils/raven'


# Fix for http://www.hull.io/docs/users/backend on browsers where 3rd party cookies disabled
fixCookies = (userSig)->
  try
    if window.jQuery && _.isFunction(window.jQuery.fn.ajaxSend)
        window.jQuery(document).ajaxSend (e, xhr, opts)->
          if userSig && !opts.crossDomain
            xhr.setRequestHeader('Hull-User-Sig', userSig)
  catch e


setUserContext = (user)->
  try
    if user && user.id
      Raven.setUserContext({
        id: user.id,
        email: user.email
      })
  catch e



class CurrentUser

  constructor: ->
    @clear()

  get: (key) =>
    # Ensure logged out user gives Null, not False
    return null if !key and !@me
    getKey(@me, key)

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
    setUserContext(me)
    me

  set : (me) =>
    prevUpdatedAt = @me?.updated_at
    prevId = @me?.id

    # Silently update now
    @me = me
    setUserContext(me)

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
