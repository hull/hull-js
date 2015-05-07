assign                   = require '../../polyfills/assign'
_                        = require '../../utils/lodash'

RawDeploymentStrategy    = require './strategies/raw'
ScopeDeploymentStrategy  = require './strategies/scope'
IframeDeploymentStrategy = require './strategies/iframe'
JSDeploymentStrategy     = require './strategies/js'

registry = {}

resetDeployments = () ->
  deployment.destroy() for own key, deployment of registry
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

  ###*
   * Fetches all targets specified in a deployment
   * @param  {object} opts options object. opts.refresh = true|false // Force Refresh
   * @return {Nodes Array} A memoized array of Nodes matching the Query Selector (this.targets) 
  ###
  getTargets : (opts={})->
    return @targets if @targets and !opts.refresh
    return [] unless @settings._selector

    if @settings._multi
      document.querySelectorAll(@settings._selector)
    else
      target = document.querySelector(@settings._selector)
      if target then [target] else []


  getDeploymentStrategy : ()=>
    return @deploymentStrategy if @deploymentStrategy?

    DS = if @ship.index.match(/\.js$/)
      JSDeploymentStrategy
    else if !!@settings._sandbox
      IframeDeploymentStrategy
    else if @settings._sandbox == 'raw'
      RawDeploymentStrategy
    else
      ScopeDeploymentStrategy

    @deploymentStrategy = new DS(@)
    @deploymentStrategy

  embed : (opts={})=>
    # If we're refreshing, rebuild the target list
    @targets = @getTargets(opts)
    ds = @getDeploymentStrategy()
    ds.embed(@targets, opts)
    .then ()=>
      @onEmbed()

  boot: ()=>
    @getDeploymentStrategy().boot()

  onEmbed : ()=>
    @getDeploymentStrategy().onEmbed()

  destroy: ()=>
    @getDeploymentStrategy().destroy()
    @deploymentStrategy = null
  
module.exports = Deployment
