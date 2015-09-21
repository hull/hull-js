_                 = require '../../utils/lodash'
EventBus          = require '../../utils/eventbus'
Base64            = require '../../utils/base64'
getWrappedRequest = require '../wrapped-request'
scriptLoader      = require '../../utils/script-loader';
{ Promise }       = require 'es6-promise';
assign            = require '../../polyfills/assign';
displayBanner     = require '../../utils/ui/display-banner'
{ addEvent, removeEvent } = require '../../utils/dom-events'

RECAPTCHA_ONLOAD = '___recaptcha___'
RECAPTCHA_SRC = "https://www.google.com/recaptcha/api.js?onload=#{RECAPTCHA_ONLOAD}&render=explicit"

_loadRecaptchaScriptPromise = null;
loadRecaptchaScript = ->
  if (_loadRecaptchaScriptPromise?)
    return _loadRecaptchaScriptPromise

  _loadRecaptchaScriptPromise = new Promise (resolve) ->
    window[RECAPTCHA_ONLOAD] = resolve
    scriptLoader({ src: RECAPTCHA_SRC });
    return null

  return _loadRecaptchaScriptPromise;

class TrackEventMatcher
  #TODO Make this clearer.
  constructor: (config)->
    if config == false || config?.ignore?
      @mode = 'ignore'
      @_initMatchers(config.ignore)
    else if !config?
      @mode = 'match_all'
    else
      @mode = 'match'
      @_initMatchers(config?.only || config)

  _initMatchers: (m)->
    m = [m] if _.isString(m)
    @matchers = _.map _.compact(m), (c)->
      _c = c.toString()
      if /^\/.*\/$/.test(_c)
        new RegExp(_c.slice(1,-1))
      else
        _c

  isTracked: (event)->
    return false unless event?
    return true if @mode == 'match_all'
    ret = _.some _.map @matchers, (m)->
      if _.isFunction(m.test)
        m.test(event)
      else
        m == event
    if @mode == 'ignore'
      return !ret
    else
      return ret

# Ajax Response Middlewares
trackResponse  = (response={})=>
  if track = response.headers?['Hull-Track']
    try
      [eventName, trackParams] = JSON.parse(Base64.decode(track))
      EventBus.emit('remote.track',{event:eventName,params:trackParams})
    catch error
      # Don't throw an error here but report what happened.
      "Invalid Tracking header : ${JSON.stringify(errror,null,2)}"
  return response

stopEventPropagation = (e) ->
  e.stopPropagation()

removeBanner = (banner) ->
  removeEvent(banner, 'click', stopEventPropagation)
  banner.remove()

class HullService
  constructor: (config, gateway)->
    @config = config
    middlewares = [@ensureIsHuman, trackResponse]

    @request = getWrappedRequest({ name:'hull', path: null }, gateway, middlewares)
    @trackMatcher = new TrackEventMatcher(config.track)

  ensureIsHuman: (response) =>
    return response if (typeof response.body != 'object')

    { sitekey, stoken } = response.body;

    return response if (response.status != 429 || !sitekey? || !stoken?)

    banner = @_getCaptchaBanner()
    performRequest = @request
    return new Promise (resolve, reject) ->
      loadRecaptchaScript().then ->
        grecaptcha.render banner.querySelector('.hull-captcha-container'),
          sitekey: sitekey,
          stoken: stoken,
          callback: (captchaResponse) ->
            EventBus.emit('remote.iframe.hide');
            removeBanner(banner)

            requestWithCaptcha = assign {}, response.request,
              headers: assign {}, response.request.headers, { 'X-Captcha-Response': captchaResponse }
            performRequest(requestWithCaptcha).then(resolve, reject)

        document.body.appendChild(banner)

        EventBus.emit('remote.iframe.show');

  _getCaptchaBanner: ->
    removeBanner(@_banner) if @_banner

    @_banner = displayBanner('captcha', false)
    addEvent(@_banner, 'click', stopEventPropagation)

    @_banner

module.exports = HullService
