_        = require '../../utils/lodash'
EventBus = require '../../utils/eventbus'
assign   = require '../../polyfills/assign'


class Tracker
  constructor : (api, currentUser)->
    @api = api
    @currentUser = currentUser
    @setupTracking()

  getCurrentUserId: -> @currentUser.get('id')

  setupTracking: ->
    return if @setup

    @setup = true

    self = this

    EventBus.on 'hull.*.share', (res)->
      self.track(this.event, res)

    EventBus.on 'hull.user.create', (me)->
      providers = _.pluck me.identities, 'provider'
      self.track 'hull.user.create', { providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.update', (me)->
      self.track 'hull.user.update', {}

    EventBus.on 'hull.user.login', (me, provider)->
      providers = _.pluck me.identities, 'provider'
      provider = provider || me.main_identity
      self.track 'hull.user.login', { provider: provider, providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.logout', ()->
      self.track('hull.user.logout')

  track: (event, payload, success, failure)=>
    @api.message
      provider: 'track'
      path: event
    , 'post', { payload: payload, url: document.location.href, referer: document.referrer }

module.exports = Tracker
