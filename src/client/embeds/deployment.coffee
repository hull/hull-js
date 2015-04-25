assign   = require '../../polyfills/assign'
_        = require '../../utils/lodash'
promises = require '../../utils/promises'

SandboxedDeploymentStrategy = require './strategies/sandbox'
RawDeploymentStrategy       = require './strategies/raw'
ScopedDeploymentStrategy    = require './strategies/scope'
JSDeploymentStrategy        = require './strategies/js'

registry = {}

resetDeployments = () ->
  deployment.remove() for own key, deployment of registry
  registry = {}

getDeployment = (id)-> registry[id]

class Deployment
  @resetDeployments: resetDeployments

  @getDeployment : getDeployment

  constructor: (dpl, context)->
    return registry[dpl.id] if registry[dpl.id]
    registry[dpl.id] = @
    @id         = dpl.id
    @name       = dpl.ship.name

    @organization = assign({}, context.org)
    @platform   = dpl.platform
    @ship       = dpl.ship

    @settings   = dpl.settings
    # "_selector" : ".ship", //CSS3 Selector on which to embed the ship(s)
    # "_multi": true, //Wether to embed on the first matching element or all
    # "_placement" : "before"|"after"|"append"|"prepend"|"replace", //Position relative to selector
    # "_sandbox" : true //Wether to sandbox the platform : true
    # "_width" : "100%", //Dimensions to give the containing element. Passed as-is as style tag
    # "_height" : "50px", //Dimensions to give the containing element. Passed as-is as style tag

    @getTargets()
    @_onEmbeds  = []
    @_styles    = []
    @_imports   = []
    @_elements  = []
    @_callbacks = []

  ###*
   * Fetches all targets specified in a deployment
   * @param  {object} opts options object. opts.refresh = true|false // Force Refresh
   * @return {Nodes Array} A memoized array of Nodes matching the Query Selector (this.targets) 
  ###
  getTargets : (opts={})->
    @targets ||= []
    return @targets if (@targets and !opts.refresh) || !@settings._selector

    @targets = if @settings._multi
      document.querySelectorAll(@settings._selector)
    else
      target = document.querySelector(@settings._selector)
      if target then [target] else []


  embed : (opts={}, embedCompleteCallback)=>
    dfd = promises.deferred()

    # If we're refreshing, rebuild the target list
    @getTargets({refresh:opts.refresh}) if opts.refresh
    @_callbacks.push(embedCompleteCallback) if _.isFunction(embedCompleteCallback)


    @settings._sandbox = 'raw'
    
    DS = if @ship.index.match(/\.js^/)
      JSDeploymentStrategy
    else if @settings._sandbox == 'raw'
      RawDeploymentStrategy
    else if !!@settings._sandbox
      SandboxedDeploymentStrategy
    else
      ScopedDeploymentStrategy

    ds = new DS
      id       : @id
      settings : @settings
      ship     : @ship          

    ds.deploy(@targets).then ()=>
      cb.call(@) for cb in @_callbacks
      @_callbacks = []
    .done()

    dfd.promise

  remove: ()=>
    @targets = false
    el = @_elements.shift()
    link = document.querySelector("link[rel=\"import\"][href=\"#{@ship.index}\"]")
    link.parentNode.removeChild link if link?.parentNode?
    while el
      el?.parentNode?.removeChild el
      el = @_elements.shift()

  
module.exports = Deployment
