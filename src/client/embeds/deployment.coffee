assign                   = require '../../polyfills/assign'
_                        = require '../../utils/lodash'
clone                    = require '../../utils/clone'
throwErr                 = require '../../utils/throw'
logger                   = require '../../utils/logger'

RawDeploymentStrategy    = require './strategies/raw'
ScopeDeploymentStrategy  = require './strategies/scope'
IframeDeploymentStrategy = require './strategies/iframe'
JSDeploymentStrategy     = require './strategies/js'

deploymentRegistry = {}
shipRegistry = {}

resetDeployments = () ->
  deployment.destroy() for own key, deployment of deploymentRegistry
  shipRegistry = {}
  deploymentRegistry = {}

getDeployment = (id)-> deploymentRegistry[id]
getDeployments = (id)-> _.values(shipRegistry[id])

class Deployment
  @resetDeployments: resetDeployments
  @getDeployment   : getDeployment
  @getDeployments  : getDeployments

  constructor: (dpl, context)->
    return deploymentRegistry[dpl.id] if deploymentRegistry[dpl.id]
    deploymentRegistry[dpl.id] = @

    @id         = dpl.id
    @name       = dpl.ship.name

    @organization = assign({}, context.org)
    @platform   = dpl.platform
    @ship       = dpl.ship

    shipRegistry[dpl.ship.id] ||= {}
    shipRegistry[dpl.ship.id][dpl.id] = @


    # onUpdate is used to attach handlers for ship.update events emitted from Hull's dashboard
    @onUpdate = dpl.onUpdate

    @settings   = dpl.settings
    # "_selector" : ".ship", //CSS3 Selector on which to embed the ship(s)
    # "_multi": true, //Wether to embed on the first matching element or all
    # "_placement" : "before"|"after"|"append"|"top"|"replace", //Position relative to selector
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

    targets = if @settings._multi
      document.querySelectorAll(@settings._selector)
    else
      target = document.querySelector(@settings._selector)
      if target then [target] else []

    logger.info("No deployment targets for selector #{@settings._selector}", @) unless targets.length
    targets

  getPublicData: ()=>
    assign(clone({
      ship         : @ship
      organization : @organization
      platform     : @platform
      settings     : @settings
    }), {
      onUpdate: (@onUpdate || ->)
    })

  getDeploymentStrategy : ()=>
    return @deploymentStrategy if @deploymentStrategy?

    DS = if @ship.index.match(/\.js$/)
      JSDeploymentStrategy
    else if @settings._sandbox == 'raw'
      RawDeploymentStrategy
    else if !!@settings._sandbox
      IframeDeploymentStrategy
    else
      ScopeDeploymentStrategy

    @deploymentStrategy = new DS(@)
    @deploymentStrategy

  embed : (opts={})=>
    # If we're refreshing, rebuild the target list
    @targets = @getTargets(opts)
    ds = @getDeploymentStrategy()
    if @targets.length
      ds.embed(@targets, opts).then ()=>
        @onEmbed()
      ,throwErr
      .catch throwErr
    else
      Promise.resolve()

  boot: ()=>
    if @targets.length
      @getDeploymentStrategy().boot()

  onEmbed : (callback)=>
    if @targets.length
      @getDeploymentStrategy().onEmbed(callback)

  destroy: ()=>
    if @targets.length
      @getDeploymentStrategy().destroy()
      @deploymentStrategy = null

module.exports = Deployment
