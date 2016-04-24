assign         = require '../../polyfills/assign'
_              = require '../../utils/lodash'
getIframe      = require '../../utils/get-iframe'
findUrl        = require '../../utils/find-url'
clone          = require '../../utils/clone'
StyleObserver  = require '../style/observer'
throwErr       = require '../../utils/throw'

class Sandbox
  constructor : (deployment)->
    @ship = deployment.ship
    @shipClassName = ".ship-#{@ship.id}"
    @deployment = deployment

    @callbacks = []
    @_scopes = []

    @hull = assign({}, window.Hull, {
      getDocument      : @getDocument
      getShipClassName : @getShipClassName
      track            : @track
      share            : @share
    });

  ###*
   * Performs a track that has the `ship_id` field set correctly
   * @param  {[type]} name       [description]
   * @param  {[type]} event={} [description]
   * @return {[type]}            [description]
  ###
  track : (name, event={})=>
    event.ship_id = @ship.id
    Hull.track(name, event)

  share: (opts={}, event={})=>
    opts.params = assign({}, opts.params, { ship_id: @ship.id })
    Hull.share(opts, event)


  setDocument : (doc)->
    return unless doc?
    @_document = doc

  getDocument : ()=> @_document

  getShipClassName : => @shipClassName

  get : ()-> @hull

  destroy: ()=>
    @_scopes = []

module.exports = Sandbox
