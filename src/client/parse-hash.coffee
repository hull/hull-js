decodeHash    = require '../utils/decode-hash'
EventBus      = require '../utils/eventbus'
displayBanner = require './ui/display-banner'

detectToken = ()->
  unless window.location.href.match('//.+\.hullapp\.io/.+/remote.html') # prevent this when in remote.html
    hash = decodeHash()
    if hash?.success && hash?.token
      if window?.opener?.Hull? and window?.opener?.__hull_login_status__ and !!hash
        window.opener.__hull_login_status__(hash)
        window.close()

detectSnippet = (config)->
  hash = decodeHash()
  snippet = hash?.hull?.snippet

  if snippet
    origin        = snippet.origin
    platformOk    = snippet.platformId == config.appId

    snippetOrgUrl = snippet.orgUrl.replace(/^http:/,'https:')
    orgUrl        = config.orgUrl.replace(/^http:/,'https:')
    orgOk         = snippetOrgUrl == orgUrl

    check         = snippet.check 

    window.location.hash=""

    if(orgOk && platformOk)
      opener.postMessage({ result: check }, origin);
      EventBus.once 'hull.snippet.success', ()->
        opener?.postMessage({ result: check }, origin);
        window.close()
      displayBanner('platform')
    else
      response = { code:'invalid', orgUrl: orgUrl, platformId: config.appId }
      opener?.postMessage({ error: btoa(JSON.stringify(response)) }, origin);


module.exports = { detectToken, detectSnippet }
