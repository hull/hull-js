Promise  = require 'bluebird/js/browser/bluebird.core'

Promise.deferred = Promise.deferred || ->
  dfd = {}
  dfd.promise = new Promise (resolve, reject)=>
    dfd.resolve = resolve
    dfd.reject = reject
  dfd

module.exports = Promise
