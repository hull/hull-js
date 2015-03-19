_ = require '../utils/lodash'

dasherize = (str)->
  str.replace /[A-Z]/, (c) ->  "-" + c.toLowerCase()

valid =

  regex: (reg)-> (val, key)->
    check = reg.test(val)
    if !check
      console.error("[Hull.init] invalid format for '#{key}'. Value '#{val}' should match #{reg.toString()}")
    check

  https: (val, key)->
    check = /^https:|^\/\//.test(val)
    if document.location.protocol == 'https:'
      return check
    else
      check or console.warn("[Hull.init] #{key} should be loaded via https. Current value is ", val)
      true


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
    transform: transform.url
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
  embed: { default: true, transform: transform.bool },
  autoStart: { default: true, transform: transform.bool },
  accessToken: { default: null }
}


getParamValue = (el, param, key)->
  keys = [key].concat(param.altKeys || [])
  transform = param.transform || (o)-> o
  value = _.reduce(keys, (ret, k)->
    if ret == null
      value = transform((el.getAttribute(dasherize(k)) || el.getAttribute(k) || el.dataset[k]), key)
      valid = value? && (!param.validation  || param.validation(value, k))
      ret = value if valid
    ret
  , null)

  if value? then value else param.default


module.exports = ->

  hull_js_sdk = document.getElementById('hull-js-sdk')

  return unless hull_js_sdk

  # Map known config values to Hull init
  _.reduce initParams, (config, param, key)->
    return unless config
    value = getParamValue(hull_js_sdk, param, key)
    if value?
      config[key] = value
    else if param.required
      config = false
    config
  , {}
