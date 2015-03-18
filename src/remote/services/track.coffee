cookies           = require '../../utils/cookies'
analyticsId       = require '../../utils/analytics-id'
getWrappedRequest = require '../wrapped-request'
RemoteConfigStore   = require '../../flux/stores/RemoteConfigStore'
GenericService    = require './generic_service'
Base64 = require('js-base64').Base64



# Analytics.js methods
# initializeAnalytics = (appSettings={})->
#   settings = _.reduce (appSettings), (settings,s)->
#     settings[s.name] = s
#     return settings
#   , {}

#   # analytics.init(settings)

# identifyWithAnalytics = (me={}) ->
#   identified = !!me.id?
#   return unless identified

#   signInCount = me.stats?.sign_in_count || 0
#   # analytics.alias(me.id) if identified && signInCount == 1

#   ident = _.pick(me, 'name', 'email', 'id', 'picture')
#   ident.created = me.created_at
#   ident.distinct_id = me.id
#   # analytics.identify(me.id, ident)

# identifyResponse = (response={})->
#   return unless response.request.url == '/api/v1/me'
#   identifyWithAnalytics(response.me)

class HullTrackService extends GenericService
  name : 'hull'

  constructor: (config, gateway)->
    super(config, gateway)
    @_request = @wrappedRequest
    # initializeAnalytics(config.settings.analytics)
    # @analyticsDefaults =
    #   url              : @config.data.request.url.href
    #   path             : @config.data.request.url.path
    #   referrer         : @config.data.request.referrer?.href
    #   referring_domain : @config.data.request.referrer?.host
    #   browser_id       : analyticsId.getBrowserId()
    #   session_id       : analyticsId.getSessionId()
    #TODO : move this elsewhere;
    # identifyWithAnalytics(config.data.me) if config.data.me?
    # @trackWithAnalytics('hull.app.init')


  # trackWithAnalytics : (event, params={})->
  #     return unless @trackMatcher.isTracked(event)
  #     params.hull_app_id    = @config?.appId
  #     params.hull_app_name  = @config?.data?.app?.name
  #     _.defaults params, @analyticsDefaults
  #     # analytics.track(event, params)


  identitfy: (me)->

  request: (opts, callback, errback) =>
    {event, params} = opts
    params ?= {}
    return false unless event?
    # @trackWithAnalytics(event,params)
    config = RemoteConfigStore.getState().remoteConfig
    referrer = RemoteConfigStore.getState().clientConfig?.track?.referrer

    method               = 'post'
    params.event        ?= event
    params.referrer      = referrer if referrer?
    params.hull_app_id   = config?.appId
    params.hull_app_name = config?.data?.app?.name

    data = {t: Base64.btoa(JSON.stringify(params))}

    @_request({path: "t", method, params:data, nocallback: true})
    .then (response)=>
      response.provider = 'track'
      response
    .then callback, errback
module.exports = HullTrackService
