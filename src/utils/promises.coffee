Promise  = require('es6-promise').Promise

buildPromise = ()->
  dfd = {}
  dfd.promise = new Promise (resolve, reject)=>
    dfd.resolve = resolve
    dfd.reject = reject
  dfd

module.exports =   {
  deferred: buildPromise
  all: Promise.all
}
