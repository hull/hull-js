promises    = require '../utils/promises'

# Wraps config failure
onConfigFailure = (err)->
  throw err


# Parse the tracked events configuration and standardize it.
formatTrackConfig = (cfg)->
  return undefined unless cfg?
  switch (Object.prototype.toString.call(cfg).match(/^\[object (.*)\]$/)[1])
    when "Object"
      if cfg.only?
        { only: (m.toString() for m in cfg.only) }
      else if cfg.ignore?
        { ignore: (m.toString() for m in cfg.ignore) }
    when "RegExp"
      { only: cfg.toString() }
    when "Array"
      { only: (m.toString() for m in cfg)  }


module.exports = (config)->
  config.track  = formatTrackConfig(config.track) if config.track?
  dfd = promises.deferred();
  msg = "You need to pass some keys to Hull to start it: " 
  readMore = "Read more about this here : http://www.hull.io/docs/references/hull_js/#hull-init-params-cb-errb"
  # Fail right now if we don't have the required setup
  if config.orgUrl and config.appId
    # Auto add protocol if we dont have one of http://, https://, //
    dfd.reject(new Error(" You specified orgUrl as #{config.orgUrl}. We do not support protocol-relative URLs in organization URLs yet.")) if config.orgUrl.match(/^\/\//)
    config.orgUrl ="https://#{config.orgUrl}" unless config.orgUrl.match(/^http[s]?:\/\//)
    dfd.resolve()
  else
    dfd.reject(new Error "#{msg} We couldn't find `orgUrl` in the config object you passed to `Hull.init`\n #{readMore}") unless config.orgUrl
    dfd.reject(new Error "#{msg} We couldn't find `platformId` in the config object you passed to `Hull.init`\n #{readMore}") unless config.appId
  return dfd.promise.fail(onConfigFailure)
