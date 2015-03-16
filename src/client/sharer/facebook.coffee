GenericShare = require './generic_share'
isMobile     = require '../../utils/is-mobile'

class FacebookShare extends GenericShare
  defaultMethod: 'share'

  constructor : (api, auth, currentUser, opts)->
    super(api, auth, currentUser, 'facebook', opts)
    @params = opts.params

    @opts.method   ||= @defaultMethod

    @params.href = @params.url if @opts.method=='share'  
    @params.link = @params.url if @opts.method=='feed'
    delete @params.url


    return @sharePopup()   if isMobile()     or (@opts.display || @params.display)=='popup'
    return @sharePromise() if opts.anonymous or @currentUser.hasIdentity('facebook')

    return @_ensureLogin().then(@sharePromise)

  sharePromise : () =>
    @api.message({provider:@provider, path:"ui.#{@opts.method}"},@params)

  sharePopup : ()=>
    debugger
    # params.redirect_uri = hull.config('orgUrl')+"/api/v1/services/facebook/callback?data="+btoa(params)
    @opts.redirect_uri = window.location.href
    @opts.app_id = Hull?.config()?.services?.settings?.facebook_app?.appId
    [@opts.width, @opts.height] = if @opts.display == 'popup' then [500, 400] else [1030, 550]
    @_popup("https://www.facebook.com/dialog/#{@opts.method}", @opts)

module.exports = FacebookShare
