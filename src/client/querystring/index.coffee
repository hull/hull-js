_    = require '../../utils/lodash'
qs   = require '../../utils/query-string-encoder'

pick = (prefix, obj) -> _.reduce obj, (m, v, k) ->
  m[k.replace(prefix,'')] = k if k.indexOf(prefix) == 0
  m

# Segment QueryString API compatibility layer
class QueryString
  constructor : (traits, tracker, alias, currentUser)->
    @alias = alias
    @currentUser = currentUser
    @traits = traits
    @track = track

    @parse()
    @pardot()

  getCurrentUserId: -> @currentUser.get('id')

  pardot: () =>
    ref = window.location.referrer
    return unless ref.indexOf("https://go.pardot.com")
    q = qs.decode(window.location.referrer.split('httpsRedirect?')[1])
    return unless _.size(q)
    @alias("pardot:#{q.visitor_id}") if q.visitor_id

  parse: () =>
    q = qs.decode()
    return unless _.size(q)

    { hjs_uid, hjs_event, hjs_aid } = q

    @alias(hjs_aid) if hjs_aid

    traits = pick('hjs_trait_', q)
    @traits(hjs_uid, traits) if _.size(traits)

    props = pick('hjs_prop_', q)
    @tracker.track(hjs_event, props) if hjs_event


module.exports = QueryString
