assign              = require 'object-assign'
_                   = require '../utils/lodash'
EventBus            = require '../utils/eventbus'
promises            = require '../utils/promises'
clone               = require '../utils/clone'
RemoteConfigStore   = require '../flux/stores/RemoteConfigStore'
RemoteHeaderStore   = require '../flux/stores/RemoteHeaderStore'
RemoteHeaderActions = require '../flux/actions/RemoteHeaderActions'

# require 'whatwg-fetch' #Polyfill for Global -> Not ready from primetime
superagent          = require 'superagent'
API_PATH = '/api/v1/'
API_PATH_REGEXP = /^\/?api\/v1\//
RESPONSE_HEADERS = ['Hull-Auth-Scope', 'Hull-Track', 'Hull-User-Id', 'Hull-User-Sig', 'X-Hits-Count', 'Link']

normalizePath = (path) ->
  return path.replace(API_PATH_REGEXP, API_PATH) if API_PATH_REGEXP.test(path)
  path = path.substring(1) if path[0] == '/'
  API_PATH + path

batchable = (threshold, fn) ->
  timeout = null
  args = []

  ()->
    args.push Array::slice.call(arguments)
    clearTimeout timeout
    delayed = =>
      fn.call(@, args)
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

resolveResponse = (request, response, deferred)->
  headers = reduceHeaders(response.headers)
  h = { body: response.body, headers: headers, request: request }
  return if (response.status >= 200 && response.status < 300) then deferred.resolve(h) else deferred.reject(h)

class Gateway

  constructor: (config={}) ->
    {batching, appId, access_token} = config
    @options = _.defaults({},batching,{min:1,max:1,delay:2})
    @queue = batchable @options.delay, (requests) -> @flush(requests)

  fetch : (options={}) =>
    dfd = promises.deferred()

    {method, headers, path, params} = options

    method = (method||'get').toUpperCase()

    config  = RemoteConfigStore.getState().clientConfig
    headers = assign({},RemoteHeaderStore.getState(), headers)

    #TODO Check SuperAgent under IE8 and below

    s = superagent(method, path).set(headers)

    if params? and method=='GET' then s.query(params) else s.send(params)

    d = new promises.deferred()


    console.log(">", method, path, params) if config.debug?.enable?

    s.end (response)=>
      console.log("<", method, path, response) if config.debug?.enable?
      h = {body:response.body, headers: response.headers, status: response.status}
      if (response.ok) then d.resolve(h) else d.reject(h)

    d.promise

  flush: (requests) ->
    if requests.length <= @options.min
      while requests.length
        [request, deferred] = requests.pop()
        @handleOne(request, deferred)
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
    d = new promises.deferred()
    _.each @before_middlewares, (middleware)-> middleware(request)
    @queue(request, d)
    promise = d.promise
    unless request.nocallback
      _.each @after_middlewares, (middleware)->
        promise
        .then middleware
        .fail (err)->
          throw new Error("Error: in request : #{err.response.message}")
    promise

  # Single request posting
  handleOne: (request, deferred) ->

    success = (response)->
      resolveResponse(request, response, deferred)

    error = (error)->
      response = error.body
      deferred.reject({response,  request, headers: {}})

    @fetch(request).then(success, error).done()

  # Batching API posting
  handleMany: (requests) ->
    params = formatBatchParams(requests)

    success = (responses)->
      resolveResponse(requests[i], response, requests[i][1]) for response, i in responses.body.results
      undefined #Don't forget this to keep the promise chain alive

    error = (response)->
      request[1].reject({response:response, headers: {}, request: request}) for request in requests

    @fetch({method: 'post', path: '/api/v1/batch', params }).then(success, error).done()

module.exports = Gateway
