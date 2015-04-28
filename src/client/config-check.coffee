# Wraps config failure
onConfigFailure = (err)->
  throw err


# Parse the tracked events configuration and standardize it.
formatTrackConfig = (config={})->
  switch (Object.prototype.toString.call(config).match(/^\[object (.*)\]$/)[1])
    when "Object"
      if config.only?
        config = { only: (m.toString() for m in config.only) }
      else if config.ignore?
        config = { ignore: (m.toString() for m in config.ignore) }
      else 
        config
    when "RegExp"
      config = { only: config.toString() }
    when "Array"
      config = { only: (m.toString() for m in config)  }
  # Setup initial referrer
  config.referrer = document.referrer if document?.referrer
  config


module.exports = (config)->
  config.track  = formatTrackConfig(config.track)
  promise = new Promise (resolve, reject)->
    msg = "You need to pass some keys to Hull to start it: " 
    readMore = "Read more about this here : http://www.hull.io/docs/references/hull_js/#hull-init-params-cb-errb"
    # Fail right now if we don't have the required setup
    if config.orgUrl and config.appId
      # Auto add protocol if we dont have one of http://, https://, //
      reject(new Error(" You specified orgUrl as #{config.orgUrl}. We do not support protocol-relative URLs in organization URLs yet.")) if config.orgUrl.match(/^\/\//)
      config.orgUrl ="https://#{config.orgUrl}" unless config.orgUrl.match(/^http[s]?:\/\//)
      resolve()
    else
      reject(new Error "#{msg} We couldn't find `orgUrl` in the config object you passed to `Hull.init`\n #{readMore}") unless config.orgUrl
      reject(new Error "#{msg} We couldn't find `platformId` in the config object you passed to `Hull.init`\n #{readMore}") unless config.appId
  promise.then(null, onConfigFailure)
  promise
