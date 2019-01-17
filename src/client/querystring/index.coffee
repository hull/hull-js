_    = require '../../utils/lodash'
qs   = require '../../utils/query-string-encoder'

pick = (prefix, obj) -> _.reduce obj, (m, v, k) ->
  m[k.replace(prefix,'')] = v if k.indexOf(prefix) == 0
  m
, {}

class QueryString
  constructor : (traits, track, alias, currentUser)->
    @alias = alias
    @currentUser = currentUser
    @traits = traits
    @track = track
    @parse()

  getCurrentUserId: -> @currentUser.get('id')

  parse: () =>
    q = qs.decode()
    return unless _.size(q)

    { hjs_uid, hjs_event, hjs_aid } = q

    @alias(hjs_aid) if hjs_aid

    traits = pick('hjs_trait_', q)
    @traits(traits) if _.size(traits)

    attrs = pick('hjs_attr_', q)
    @traits(attrs) if _.size(attrs)

    props = pick('hjs_prop_', q)
    @tracker.track(hjs_event, props) if hjs_event


module.exports = QueryString
