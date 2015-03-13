EventBus = require '../../utils/eventbus'
assign   = require 'object-assign'


class Tracker
  constructor : (api)->
    @api = api
    @setupTracking()

  setupTracking : () ->

    EventBus.on 'hull.*.share', (res)->
      @track this.event, res

    EventBus.on 'hull.user.create', (me)=>
      providers = _.pluck me.identities, 'provider'
      @track 'hull.user.create', { providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.login', (me, provider)=>
      providers = _.pluck me.identities, 'provider'
      provider = provider || me.main_identity
      @track 'hull.user.login', { provider: provider, providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.logout', ()->
      track('hull.user.logout')

  track : (event,params)=>
    # Enrich Data before sending
    data = assign {url:window.location.href,referrer:document.referrer}, params
    @api.message
      provider:'track'
      path: event
    , 'post', data

module.exports = Tracker
