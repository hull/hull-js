assign            = require '../../polyfills/assign'
EventBus          = require '../../utils/eventbus'
RemoteUserStore   = require '../../flux/stores/RemoteUserStore'
GenericService    = require './generic-service'
Base64            = require '../../utils/base64'


StructuredEventProps = ['category', 'action', 'label', 'property', 'value']
MarketingProps = ['campaign', 'source', 'medium', 'term', 'content']
TopLevelProps = ['hull_ship_id'].concat(StructuredEventProps)

Identity = (o)-> o

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

    EventBus.emit('remote.tracked', { event, params: params.payload });

    @_request({
      path: 't',
      method: 'post',
      params: {
        event: event,
        properties: params.payload,
        url: params.url,
        referer: params.referer || ""
      },
      nocallback: true
    }).then (response)=>
      response.provider = 'track'
      response
    .then (callback || Identity), (errback || Identity)


module.exports = HullTrackService
