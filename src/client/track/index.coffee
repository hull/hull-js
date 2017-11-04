_        = require '../../utils/lodash'
EventBus = require '../../utils/eventbus'
assign   = require '../../polyfills/assign'

bind = window.addEventListener ? 'addEventListener' : 'attachEvent';
unbind = window.removeEventListener ? 'removeEventListener' : 'detachEvent';
prefix = bind != 'addEventListener' ? 'on' : '';

listen = (el, type, fn, capture) => el[bind](prefix + type, fn, capture || false);

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
      providers = _.map me.identities, 'provider'
      self.track 'hull.user.create', { providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.update', (me)->
      self.track 'hull.user.update', {}

    EventBus.on 'hull.user.login', (me, provider)->
      providers = _.map me.identities, 'provider'
      provider = provider || me.main_identity
      self.track 'hull.user.login', { provider: provider, providers: providers, main_identity: me.main_identity }

    EventBus.on 'hull.user.logout', ()->
      self.track('hull.user.logout')

  trackForm: (forms, ev, properties) =>
    return false unless !!forms
    forms = [forms] if _.isElement(forms)
    _.map forms, (form) => 
      return console.log("Not an HTML element", form) unless _.isElement(form)
      trackSubmit = (e) =>
        e.preventDefault();
        evt = if _.isFunction(ev) then ev(form) else ev
        props = if _.isFunction(properties) then properties(form) else properties
        setTimeout () =>
          form.submit()
        , 500
        @track(evt, props)
      $ = (window.jQuery || window.Zepto)
      if $ then $(form).submit(trackSubmit) else listen(form, 'submit', trackForm)
    true

  track: (event, payload, success, failure)=>
    @api.message
      provider: 'track'
      path: event
    , 'post', { payload: payload, url: document.location.href, referer: document.referrer }

module.exports = Tracker
