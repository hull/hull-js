_        = require '../../utils/lodash'
EventBus = require '../../utils/eventbus'
assign   = require '../../polyfills/assign'


class Tracker
  constructor : (api, remoteConfig, config)->
    @api = api
    @setupTracking()

  getCurrentUserId: -> @api.currentUser.getId()

  setupTracking : () ->
    return if @setup
    @setup=true

    EventBus.on 'hull.*.share', (res)=>
      @track this.event, res

    EventBus.on 'hull.user.create', (me)=>
      providers = _.pluck me.identities, 'provider'
      @track 'hull.user.create', { providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.update', (me)=>
      @track 'hull.user.update', {}

    EventBus.on 'hull.user.login', (me, provider)=>
      providers = _.pluck me.identities, 'provider'
      provider = provider || me.main_identity
      @track 'hull.user.login', { provider: provider, providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.logout', ()=>
      @track('hull.user.logout')

  track : (event, params, success, failure)=>
    data = assign {}, params
    @api.message
      provider:'track'
      path: event
    , 'post', data

module.exports = Tracker
