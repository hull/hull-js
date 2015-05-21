_        = require '../../../utils/lodash'
RawDeploymentStrategy = require './raw'

class ScopeDeploymentStrategy extends RawDeploymentStrategy
  scopeStyles : true
  ignoredTags : ['#comment','SCRIPT','LINK','STYLE']

module.exports = ScopeDeploymentStrategy
