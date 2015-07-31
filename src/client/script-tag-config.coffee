_ = require '../utils/lodash'
logger = require '../utils/logger'

dasherize = (str)->
  str.replace /[A-Z]/, (c) ->  "-" + c.toLowerCase()


httpsRegex = /^https:|^\/\//

valid =
  regex: (reg)-> (val, key)->
    check = reg.test(val)
    if !check
      logger.error("[Hull.init] invalid format for '#{key}'. Value '#{val}' should match #{reg.toString()}")
    check

  https: (val, key)->
    check = httpsRegex.test(val)
    return true if check
    logger.warn("[Hull.init] #{key} should be loaded via https. Current value is ", val)
    false


transform =
  url: (url, key)->
    if url && url.length > 0
      a = document.createElement('a')
      a.href = url
      a.href

  bool: (str, key)->
    switch str
      when 'true', true then true
      when 'false', false then false
      else undefined

initParams = {
  appId: {
    validation: valid.regex(/^[a-f0-9]{24}$/i)
    required: true
    altKeys: ['shipId', 'platformId']
  },
  orgUrl: {
    validation: valid.https
    required: true
  },
  jsUrl: {
    transform: transform.url
    validation: valid.https
    altKeys: ['src']
  },
  callbackUrl: {
    transform: transform.url
    validation: valid.regex(new RegExp("^" + document.location.origin + "/"))
  },
  debug       : { default: false, transform: transform.bool },
  verbose     : { default: false, transform: transform.bool },
  embed       : { default: true,  transform: transform.bool },
  autoStart   : { default: true,  transform: transform.bool },
  accessToken : { default: null }
  customerId  : { default: null }
}

getAttribute = (el, k)->
  el.getAttribute(dasherize(k)) || el.getAttribute(k)

getParamValue = (el, param, key)->
  keys = [key].concat(param.altKeys || [])
  transform = param.transform || (o)-> o
  value = _.reduce(keys, (ret, k)->
    if ret == null
      value = transform(getAttribute(el, k), key)
      valid = value? && (!param.validation  || param.validation(value, k, el))
      ret = value if valid
    ret
  , null)

  if value? then value else param.default


module.exports = ->
  hull_js_sdk = document.getElementById('hull-js-sdk')

  return unless hull_js_sdk

  # Map known config values to Hull init
  out = _.reduce initParams, (config, param, key)->
    return unless config
    value = getParamValue(hull_js_sdk, param, key)
    if value?
      config[key] = value
    else if param.required
      config = false
    config
  , {}
  logger.error("[Hull.init] jsUrl NEEDS be loaded via https if orgUrl is https ") if httpsRegex.test(out.orgUrl) and not httpsRegex.test(out.jsUrl)
  out
