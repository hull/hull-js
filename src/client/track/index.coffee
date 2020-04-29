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

  trackForm: (forms, eventName, properties, { stopPropagation = false, useCapture = true, submitDelay = 2000 } = {}) =>
    return false unless !!forms
    isDynamic = _.isString(forms)
    trackSubmit = (event) =>
      nodes = Array.prototype.slice.call document.querySelectorAll(forms)
      # Early return if form doesn't match;
      if nodes.indexOf(event.target)==-1
        return
      # attempt to stop the event propagating;
      event.preventDefault();
      event.stopPropagation() if stopPropagation;
      evtPromise = if _.isFunction(eventName) then eventName(event.target, serialize(event.target, { hash: true }), event) else eventName
      propsPromise = (if _.isFunction(properties) then properties(event.target, serialize(event.target, { hash: true }), event) else properties)||serialize(event.target, { hash: true })
      timeout = null
      submit = (source) => () =>
        console.log("Hull: Submitting Form from", source)
        return if _isSubmitted
        clearTimeout(timeout)
        _isSubmitted = true
        event.target.submit()

      Promise.all([evtPromise, propsPromise]).then (argz) =>
        [evt, props] = argz
        _isSubmitted = false
        timeout = setTimeout submit("Track Timeout")
        , submitDelay
        console.log("Hull: Submitting Form Data:", evt, props)
        @track(evt, props).then submit("Track Success"), submit("Track Error")
      , (err) =>
        console.error("Hull: User Promise Error", err)
        submit("User Promise Error")

    if isDynamic
      listen(document.body, "submit", trackSubmit, useCapture)
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
