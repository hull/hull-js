initParams = {
  'jsUrl'      : 'js-url'
  'platformId' : 'platform-id'
  'orgUrl'     : 'org-url'
  'embed'      : 'embed'
  'proxyMode'  : 'proxy-mode'
  'accessToken': 'access-token'
}

module.exports = ()->
  hull_js_sdk = document.getElementById('hull-js-sdk');

  return undefined unless hull_js_sdk

  # Map known config values to Hull init
  config = _.reduce initParams, (config, v, k)->
    value = hull_js_sdk.attributes[v]?.value
    config[k] = value if value?
    config
  ,{}

  # return undefined unless config?.platformId? and config?.orgUrl?

  # Automatically specify jsUrl unless we have overriden it.
  config.jsUrl = hull_js_sdk.src unless config.jsUrl?

  config
