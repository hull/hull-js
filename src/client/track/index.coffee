_        = require '../../utils/lodash'
EventBus = require '../../utils/eventbus'
assign   = require '../../polyfills/assign'
serialize = require '../../utils/form-serialize';

bnd = if window.addEventListener then 'addEventListener' else 'attachEvent';
unbnd = if window.removeEventListener then 'removeEventListener' else 'detachEvent';
prefix = if (bnd != 'addEventListener') then 'on' else '';

listen = (el, type, fn, capture) => el[bnd](prefix + type, fn, capture || false);

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

  trackForm: (forms, eventName, properties) =>
    return false unless !!forms
    isDynamic = _.isString(forms)
    trackSubmit = (event) =>
      nodes = Array.prototype.slice.call document.querySelectorAll(forms)
      # Early return if form doesn't match;
      if nodes.indexOf(event.target)==-1
        return
      event.preventDefault();
      evt = if _.isFunction(eventName) then eventName(event.target, serialize(event.target, { hash: true })) else eventName
      props = (if _.isFunction(properties) then properties(event.target, serialize(event.target, { hash: true })) else properties)||serialize(event.target, { hash: true })
      _isSubmitted = false
      submit = =>
        return if _isSubmitted
        _isSubmitted = true
        event.target.submit()
      timeout = setTimeout submit
      , 1000
      @track(evt, props).then submit, submit

    if isDynamic
      listen(document.body, "submit", trackSubmit, true)
    else
      formsList = [forms] if _.isElement(forms)
      _.map formsList, (form) =>
        return console.log("Not an HTML element", form) unless _.isElement(form)
        $ = (window.jQuery || window.Zepto)
        if $ then $(form).submit(trackSubmit) else listen(form, 'submit', trackSubmit)
    true

  track: (event, payload, success, failure)=>
    @api.message
      provider: 'track'
      path: event
    , 'post', { payload: payload, url: document.location.href, referer: document.referrer }

module.exports = Tracker
