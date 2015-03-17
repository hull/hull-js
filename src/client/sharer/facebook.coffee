GenericShare = require './generic_share'
isMobile     = require '../../utils/is-mobile'

supportedMethodcs = ['share', 'feed', 'apprequests']
class FacebookShare extends GenericShare
  defaultMethod: 'share'
  defaultPath: 'ui'

  constructor : (api, auth, currentUser, opts)->
    super(api, auth, currentUser, 'facebook', opts)

    @params = opts.params || {}
    @opts.path       ||= @defaultPath
    @params.method   ||= @defaultMethod

    # Use the existing href or link param and default to the looked-up url otherwise
    @params.href ||= @params.url if @params.method=='share'  
    @params.link ||= @params.url if @params.method=='feed'
    delete @params.url if @params?.url?

    @isPopup =  @opts.display=='popup' || @params.display=='popup'

    return @sharePopup()   if isMobile() or @isPopup
    return @sharePromise() if @opts.anonymous or @currentUser.hasIdentity('facebook')
    return @_ensureLogin().then(@sharePromise)

  
  sharePromise : () =>
    @api.message({provider:@provider, path:@opts.path},@params)

  sharePopup : ()=>
    # params.redirect_uri = hull.config('orgUrl')+"/api/v1/services/facebook/callback?data="+btoa(params)
    @opts.params.redirect_uri ||= window.location.href
    @opts.params.app_id       ||= Hull?.config()?.services?.auth?.facebook?.appId
    [@opts.width, @opts.height] = if @isPopup then [500, 400] else [1030, 550]
    @_popup("https://www.facebook.com/dialog/#{@params.method}", @opts, @params)

module.exports = FacebookShare
