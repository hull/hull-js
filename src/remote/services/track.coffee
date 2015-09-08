assign            = require '../../polyfills/assign'
EventBus          = require '../../utils/eventbus'
RemoteUserStore   = require '../../flux/stores/RemoteUserStore'
GenericService    = require './generic-service'
Base64            = require '../../utils/base64'


StructuredEventProps = ['category', 'action', 'label', 'property', 'value']
MarketingProps = ['campaign', 'source', 'medium', 'term', 'content']
TopLevelProps = ['hull_ship_id'].concat(StructuredEventProps)


class HullTrackService extends GenericService
  name : 'hull'

  constructor: (config, gateway)->
    super(config, gateway)

    @_request = @wrappedRequest


    RemoteUserStore.addChangeListener (change)=>
      currentUser = RemoteUserStore.getState().user
      currentUserId = currentUser?.id


  request: (opts, callback, errback) =>

    { params, path } = opts

    event = path

    @trackEvent(event, params)

    EventBus.emit('remote.tracked',{event,params});

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
