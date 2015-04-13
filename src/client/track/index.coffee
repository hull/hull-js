EventBus = require '../../utils/eventbus'
assign   = require 'object-assign'

Treasure = require 'td-js-sdk'

class Tracker
  constructor : (api, remoteConfig, config)->
    @api = api
    @td = new Treasure({
      database: 'tracks_test',
      writeKey: '4382/27f2599d9af9201060f4eb10b742dfd7e52f849b',
      clientId: remoteConfig.identify.browser
    })

    if remoteConfig.data?.me?
      @td.set('pageviews', { hull_user_id: remoteConfig.data.me.id })
    @setupTracking()

  getCurrentUserId: -> @api.currentUser.getId()

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

    @td.trackPageview('pageviews')

  track : (event,params, success, failure)=>

    # Enrich Data before sending
    @td.trackEvent('tracks', assign({
      event: event,
      hull_user_id: @getCurrentUserId()
    }, params), success, failure)

    data = assign {url:window.location.href,referrer:document.referrer}, params
    @api.message
      provider:'track'
      path: event
    , 'post', data

module.exports = Tracker
