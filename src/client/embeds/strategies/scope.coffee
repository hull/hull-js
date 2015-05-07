_        = require '../../../utils/lodash'
RawDeploymentStrategy = require './raw'

class ScopeDeploymentStrategy extends RawDeploymentStrategy
  scopeStyles : true

module.exports = ScopeDeploymentStrategy
