define ['underscore', '../utils/promises'], (_, promises)->

  CURRENT_APP = {}
  CURRENT_ORG = {}


  UTM_TAGS = {
    # CAMPAIGN MEDIUM (UTM_MEDIUM)
    # Identifies the way your ad appears on the web page (banner, PR) but I suggest you to use the Medium as you would use it within Google Analytics: Social, cpc, email, etc. This tag is also mandatory.
    utm_medium   : (opts)->
      [ 'utm_medium', 'social' ]

    # CAMPAIGN SOURCE
    # This tag is mandatory, it identifies where exactly did your ad appear. That can be a specific portal name, social network name or similar.
    # TODO: Should we use "facebook" or "platform.name"?
    # Former is more accurate from GA's point of view. Latter allows to understand where Share comes from.
    utm_source   : (opts)->
      [ 'utm_source', opts?.provider?.toLowerCase() ]

    # CAMPAIGN NAME (UTM_CAMPAIGN)
    #  A group of your ads through various mediums (banners, newsletters, articles) that cover the same topic like “Autumn collection 2014” or “Early booking 2015”. This tag is also mandatory.
    # When coming from a ship, this will be the ship name.
    # Since it's mandatory, we handle fallback with the platform name.
    utm_campaign : (opts)->
      [ 'utm_campaign', CURRENT_APP?.name ]


    #  CAMPAIGN TERM (UTM_TERM)
    # This should be the keyword you use for identifying your ad. It will also appear as “keyword” within Google Analytics report.
    # Further categorize the add with the platform name as a Term, in case it's obscured by the Ship name in utm_campaign
    utm_term: ->
      [ 'utm_term', CURRENT_APP?.name ]

    # CAMPAIGN CONTENT (UTM_CONTENT)
    # This tag is usually used for A/B testing, but it could be used for ad type, market, website language version or any other similar info that will help you distinguish one ad version from another.
    utm_content  : (opts)->
      currentUser = Hull.currentUser()
      if currentUser && currentUser.id
        ['utm_content', currentUser.id]
      else
        []
  }

  # Injects into querystring some more variables
  buildShareUrl = (url, opts)->
    hashtagParts = url.split('#')
    urlParts = hashtagParts[0].split('?')
    host = urlParts[0]
    query = urlParts.slice(1)
    _utm_tags = buildUtmTags(opts)
    qs = _.map _utm_tags, (param)->
      tuple = _.map param, (v)->encodeURIComponent(v)
      tuple.join('=')
    query = query.concat(qs)
    hashtagParts[0] = "#{host}?#{query.join('&')}"
    hashtagParts.join('#')

  buildUtmTags = (opts)->
    tags = opts.tags || {}
    # Build UTM Tags from an existing link
    # Allow User to override some tags.
    _.reduce UTM_TAGS, (arr, method, tagName)=>
      t = tags[tagName]
      if t?
        tuple = [tagName, t]
      else
        tuple = method(opts)
      arr.push(tuple) if tuple? and tuple[1]!=undefined
      arr
    , []




  isMobile = ->
    # http://stackoverflow.com/questions/11381673/javascript-solution-to-detect-mobile-browser
    n = navigator.userAgent||navigator.vendor||window.opera
    !! /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(n)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(n.substr(0,4));

  hasIdentity = (provider)->
    identities = Hull.currentUser()?.identities
    return false unless identities and provider
    _.some identities, (i) -> i.provider==provider

  to_qs = (params)->
    _.map params, (v,k) ->
      encodeURIComponent(k)+'='+encodeURIComponent(v)
    .join('&')

  facebookShare = (opts)->
    opts.method ||= 'share'

    params = opts.params


    # Setup default values for the shares.
    if opts.method == 'share'
      params.href  = buildShareUrl((params.href || window.location.href), opts)
    if opts.method == 'feed'
      params.link  = buildShareUrl((params.link || window.location.href), opts)


    sharePromise = ->
      Hull.api({ provider: opts.provider, path: "ui.#{opts.method}" }, params)

    if params.display == 'popup' or isMobile()
      return facebookPopup(opts)
    else if opts.anonymous or hasIdentity('facebook')
      return sharePromise()
    else
      return Hull.login({provider:'facebook',strategy:'popup'}).then(sharePromise)

  genericPopup = (location, opts)->
    querystring = to_qs(opts.params)
    share = window.open("#{location}?#{querystring}", 'hull_share', "location=0,status=0,width=#{opts.width},height=#{opts.height}")
    dfd = promises.deferred()
    interval = setInterval ()->
      try
        if share == null || share.closed
          window.clearInterval(interval)
          dfd.resolve({display:"popup"})
       catch e
        1 == 1
    , 500
    return dfd.promise

  facebookPopup = (opts)->
    params = opts.params
    # params.redirect_uri = Hull.config('orgUrl')+"/api/v1/services/facebook/callback?data="+btoa(params)
    params.redirect_uri = params.href || params.link
    params.app_id = Hull.config('services').auth.facebook.appId
    [opts.width, opts.height] = if params.display == 'popup' then [500, 400] else [1030, 550]
    genericPopup("https://www.facebook.com/dialog/#{opts.method}", opts)

  twitterPopup = (opts)->
    [opts.width, opts.height] = [550, 420]
    genericPopup("https://twitter.com/intent/tweet", opts)

  twitterShare  = (opts)->
    # opts.method ||= 'statuses/update'
    params = opts.params
    params.url = buildShareUrl((params.url || window.location.href), opts)
    twitterPopup(opts)


  setup: (api)->

    CURRENT_ORG = api.remoteConfig.data.org
    CURRENT_APP = api.remoteConfig.data.app

    (opts)->

      # Todo Throw error
      unless _.isObject(opts) and _.isObject(opts.params) and opts.provider?
        dfd = promises.deferred()
        dfd.reject()
        return dfd.promise

      sharePromise = switch opts.provider
        when 'facebook' then facebookShare(opts)
        when 'twitter'  then twitterShare(opts)

      sharePromise.then (response)->
        Hull.track "hull.#{opts.provider}.share", {params:opts.params,response:response}
        response

      sharePromise

