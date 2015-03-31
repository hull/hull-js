_        = require '../../utils/lodash'
promises = require '../../utils/promises'
track    = require '../track/index'
findUrl  = require '../../utils/find-url'

FacebookShare = require './facebook'
EmailShare = require './email'
TwitterShare = require './twitter'
GoogleShare = require './google'
LinkedinShare = require './linkedin'
WhatsappShare = require './whatsapp'

# Organization coming from
# http://www.degordian.com/blog/5-cool-examples-of-utm-tracking/
#
# TODO : Define whether if so, how to specify the URL where the User was shen he shared.
# This can be different from the URL he shared

utm_tags = {
  # CAMPAIGN MEDIUM (UTM_MEDIUM)
  # Identifies the way your ad appears on the web page (banner, PR) but I suggest you to use the Medium as you would use it within Google Analytics: Social, cpc, email, etc. This tag is also mandatory.
  utm_medium   : (opts, config)->
    ['utm_medium','social']

  # CAMPAIGN SOURCE
  # This tag is mandatory, it identifies where exactly did your ad appear. That can be a specific portal name, social network name or similar.
  # TODO: Should we use "facebook" or "platform.name"?
  # Former is more accurate from GA's point of view. Latter allows to understand where Share comes from.
  utm_source   : (opts, config)->
    ['utm_source',opts?.provider?.toLowerCase()]

  # CAMPAIGN NAME (UTM_CAMPAIGN)
  #  A group of your ads through various mediums (banners, newsletters, articles) that cover the same topic like “Autumn collection 2014” or “Early booking 2015”. This tag is also mandatory.
  # When coming from a ship, this will be the ship name.
  # Since it's mandatory, we handle fallback with the platform name.
  utm_campaign : (opts, config)->
    ['utm_campaign',config?.platform?.name]


  #  CAMPAIGN TERM (UTM_TERM)
  # This should be the keyword you use for identifying your ad. It will also appear as “keyword” within Google Analytics report.
  # Further categorize the add with the platform name as a Term, in case it's obscured by the Ship name in utm_campaign
  utm_term     : (opts, config)->
    ['utm_term',config?.platform?.name]

  # CAMPAIGN CONTENT (UTM_CONTENT)
  # This tag is usually used for A/B testing, but it could be used for ad type, market, website language version or any other similar info that will help you distinguish one ad version from another.
  utm_content  : (opts, config)->
    id = config.user.get('id')

    if id
      ['utm_content', id]
    else
      []

}

class Sharer
  constructor : (api, auth, currentUser, data, config)->
    @api         = api
    @auth        = auth
    @currentUser = currentUser
    @tagConfig   = {
      platform: data.app || {}
      org: data.org || {}
      user: currentUser || {}
    }
    @config = config

  # Injects into querystring some more variables
  addToQueryString : (url, params)->
    hashtagParts = url.split('#')
    urlParts = hashtagParts[0].split('?')
    host = urlParts[0]
    query = urlParts.slice(1)
    qs = _.map params, (param)->
      tuple = _.map param, (v)->encodeURIComponent(v)
      tuple.join('=')
    query = query.concat(qs)
    hashtagParts[0] = "#{host}?#{query.join('&')}"
    hashtagParts.join('#')

  buildUtmTags: (opts)=>
    tags = opts.tags || {}
    # Build UTM Tags from an existing link
    # Allow User to override some tags.
    _.reduce utm_tags, (arr, method, tagName)=>
      tuple = tags[tagName] || method(opts, @tagConfig)
      arr.push(tuple) if tuple? and tuple[1]!=undefined
      arr
    , []

  share: (opts, event={})=>
    if !_.isObject(opts)
      throw new Error("You need to pass an options hash to the share method. You passed: #{JSON.stringify(opts)}")
    else if !opts.provider?
      throw new Error("You need specify the provider on which to share. You passed: #{opts.provider}")
    else if !_.isObject(opts.params)
      opts.params = {}
      # throw new Error("You need specify some parameters to pass the provider. You passed: #{opts.params}")

    opts.params ||= {}
    # If the Sharing URL is not specified, then walk up the DOM to find some URL to share.
    # If No url is specified, will walk up to window.location.href.
    #
    # Lookup Order
    # 1. Passed-in url
    # 2. Find url from Click Targt
    # 3. Ship container node

    opts.params.url ||= findUrl(event.target)

    # Extract campaign tags from sharing hash
    tags = opts.tags
    delete opts.tags

    # Enrich the Target URL, add UTM tags.
    # Allow user-defined tags, enrich with automatic ones.
    # Later iterations will build a short link that will hide this data for us.
    utmTags = @buildUtmTags(opts)
    opts.params.url = @addToQueryString(opts.params.url, utmTags)

    sharePromise = switch opts.provider
      when 'email'    then new EmailShare(@api, @auth, @currentUser, opts, @config)
      when 'facebook' then new FacebookShare(@api, @auth, @currentUser, opts, @config)
      when 'twitter'  then new TwitterShare(@api, @auth, @currentUser, opts, @config)
      when 'google'   then new GoogleShare(@api, @auth, @currentUser, opts, @config)
      when 'linkedin' then new LinkedinShare(@api, @auth, @currentUser, opts, @config)
      when 'whatsapp' then new WhatsappShare(@api, @auth, @currentUser, opts, @config)

    params = opts.params

    sharePromise.then (response)=>
      EventBus.emit("hull.#{opts.provider}.share", {params,response})
      response
    , (err)-> throw err

module.exports = Sharer

