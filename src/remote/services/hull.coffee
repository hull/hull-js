_                 = require '../../utils/lodash'
cookies           = require '../../utils/cookies'
analyticsId       = require '../../utils/analytics-id'
EventBus          = require '../../utils/eventbus'
Base64            = require '../../utils/base64'
getWrappedRequest = require '../wrapped-request'

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

# identifyResponse= ()->
#   debugger

class HullService
  constructor: (config, gateway)->
    @config       = config
    middlewares   = [trackResponse]

    @request      = getWrappedRequest({name:'hull',path:undefined}, gateway, middlewares)
    @trackMatcher = new TrackEventMatcher(config.track)

module.exports = HullService

