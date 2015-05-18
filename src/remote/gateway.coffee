assign              = require '../polyfills/assign'
_                   = require '../utils/lodash'
EventBus            = require '../utils/eventbus'
clone               = require '../utils/clone'
ClientConfigStore   = require '../flux/stores/ClientConfigStore'
RemoteHeaderStore   = require '../flux/stores/RemoteHeaderStore'
QSEncoder           = require '../utils/query-string-encoder'

# require 'whatwg-fetch' #Polyfill for Global -> Not ready from primetime
superagent          = require 'superagent'
API_PATH = '/api/v1/'
API_PATH_REGEXP = /^\/?api\/v1\//
RESPONSE_HEADERS = ['Hull-Auth-Scope', 'Hull-Track', 'Hull-User-Id', 'Hull-User-Sig', 'X-Hits-Count', 'Link']

normalizePath = (path) ->
  return path.replace(API_PATH_REGEXP, API_PATH) if API_PATH_REGEXP.test(path)
  path = path.substring(1) if path[0] == '/'
  API_PATH + path

batchable = (threshold, callback) ->
  timeout = null
  args = []

  ()->
    args.push Array::slice.call(arguments)
    clearTimeout timeout
    delayed = =>
      callback.call(@, args)
      timeout = null
      args = []
    timeout = setTimeout delayed, threshold

reduceHeaders = (headers)->
  _.reduce RESPONSE_HEADERS, (memo, name) ->
    value = headers[name.toLowerCase()]
    memo[name] = value if value?
    memo
  , {}

formatBatchParams = (requests) ->
  params = { sequential: true }
  params.ops = for request in requests
    r = request[0]
    c = {method: r.method, url: r.path}
    c.params  = r.params if r.params?
    c.headers = r.headers if r.headers?
    c

  params

resolveResponse = (request, response, resolve, reject)->
  headers = reduceHeaders(response.headers)
  h = { body: response.body, headers: headers, request: request }
  if (response.status >= 200 && response.status < 300)
    return resolve(h)
  else
    err = {response:response.body, headers: response.headers}
    return reject(err)

class Gateway

  constructor: (config={}) ->
    {batching, appId, access_token} = config
    @options = _.defaults({},batching,{min:1,max:1,delay:2})
    @queue = batchable @options.delay, (requests) -> @flush(requests)

  fetch : (options={}) =>
    {method, headers, path, params} = options

    method = (method||'get').toUpperCase()

    clientConfig= ClientConfigStore.getState() || {}
    headers = assign({}, RemoteHeaderStore.getState(), headers)

    #TODO Check SuperAgent under IE8 and below
    s = superagent(method, path).set(headers)

    if params? and method=='GET' then s.query(QSEncoder.encode(params)) else s.send(params)

    new Promise (resolve, reject)->
      console.debug(">", method, path, params, headers) if clientConfig.debug?.enable?

      s.end (response)=>
        console.debug("<", method, path, response) if clientConfig.debug?.enable?
        h = {body:response.body, headers: response.headers, status: response.status}
        # if (response.ok) then resolve(h) else reject(h)
        resolve(h)

  flush: (requests) ->
    if requests.length <= @options.min
      while requests.length
        [request, resolve, reject] = requests.pop()
        @handleOne(request, resolve, reject)
    else
      @handleMany(requests.splice(0, @options.max))
      @flush(requests) if requests.length

  after_middlewares : []
  before_middlewares : []

  # Connect-like middleware syntax
  after : (cb)=>
    return unless (cb? and _.isFunction(cb))
    @after_middlewares.push(cb)
    cb

  before : (cb)=>
    return unless (cb? and _.isFunction(cb))
    @before_middlewares.push(cb)
    cb

  handle: (request) ->
    request.path = normalizePath request.path

    promise = new Promise (resolve, reject)=>
      _.each @before_middlewares, (middleware)-> middleware(request)
      @queue(request, resolve, reject)

    unless request.nocallback
      _.each @after_middlewares, (middleware)->
        promise
        .then middleware
        .catch (err)->
          msg = err?.response?.message || err?.response || err
          throw new Error("Error: in request : #{msg}")


    promise

  # Single request posting
  handleOne: (request, resolve, reject) ->
    success = (response)->
      resolveResponse(request, response, resolve, reject)

    error = (error)->
      response = error.body
      reject({response,  request, headers: {}})

    @fetch(request).then(success, error)

  # Batching API posting
  handleMany: (requests) ->
    params = formatBatchParams(requests)

    success = (responses)->
      resolveResponse(requests[i], response, requests[i][1], requests[i][2]) for response, i in responses.body.results
      undefined #Don't forget this to keep the promise chain alive

    error = (response)->
      request[1].reject({response:response, headers: {}, request: request}) for request in requests

    @fetch({method: 'post', path: '/api/v1/batch', params }).then(success, error)

module.exports = Gateway
