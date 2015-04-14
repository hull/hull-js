assign            = require 'object-assign'
Treasure          = require 'td-js-sdk'
uuid              = require('../../utils/uuid')
cookies           = require '../../utils/cookies'
analyticsId       = require '../../utils/analytics-id'
getWrappedRequest = require '../wrapped-request'
RemoteConfigStore = require '../../flux/stores/RemoteConfigStore'
RemoteUserStore     = require '../../flux/stores/RemoteUserStore'
GenericService    = require './generic_service'
Base64            = require '../../utils/base64'


StructuredEventProps = ['category', 'action', 'label', 'property', 'value']
MarketingProps = ['campaign', 'source', 'medium', 'term', 'content']


class HullTrackService extends GenericService
  name : 'hull'

  constructor: (config, gateway)->
    super(config, gateway)
    db = "organization_#{config.data.org.id}"

    @_request = @wrappedRequest
    td = @td = new Treasure({
      database: db
      writeKey: '6115/02eed5a653111c8321161b894dc066a7f0f929b7'
      clientId: analyticsId.getBrowserId()
      storage: 'none'
      track: {
        values: {
          td_url: config.data.request.url.href
          td_host:  config.data.request.url.host
          td_path: config.data.request.url.path
          td_referrer:  config.data.request.referrer.href || ""
        }
      }
    })

    td_context = {
      td_user_agent: window.navigator && window.navigator.userAgent,
      hull_app_id: config.appId,
      hull_session_id: analyticsId.getSessionId(),
      hull_user_id: config.data.me?.id
    }


    pageUrlParams = config.data.request.url?.params

    if !_.isEmpty(pageUrlParams)
      MarketingProps.map (k)->
        v = pageUrlParams["utm_#{k}"]
        v && td_context["mkt_#{k}"] = v

    td.set(td_context)

    td.trackPageview()

    RemoteUserStore.addChangeListener (change)=>
      tdUserId = td.get().hull_user_id
      currentUser = RemoteUserStore.getState().user
      currentUserId = currentUser?.id
      td.set({ hull_user_id: currentUserId })
      if change == 'UPDATE_USER' && currentUserId != tdUserId
        td.trackEvent('identify')


  trackEvent: (eventName, params)->

    structuredProperties = StructuredEventProps.reduce (se,prop)->
      se["se_#{prop}"] = params[prop] if params[prop]
      se
    , {}

    unstructuredProperties = _.omit(params, StructuredEventProps...)
    unstructuredEvent = {}

    if !_.isEmpty(unstructuredProperties)
      unstructuredEvent = { unstruct_event: unstructuredProperties }

    payload = assign(
      { event: eventName },
      structuredProperties,
      unstructuredEvent
    )

    @td.trackEvent('tracks', payload)

  request: (opts, callback, errback) =>

    { params, path } = opts

    event = path

    @trackEvent(event, params)

    @_request({
      path: 't',
      method: 'post',
      params: { t: Base64.encode(JSON.stringify(assign({ event }, params))) },
      nocallback: true
    }).then (response)=>
      response.provider = 'track'
      response
    .then callback, errback


module.exports = HullTrackService
