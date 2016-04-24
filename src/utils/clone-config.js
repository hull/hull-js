import _ from 'lodash';
import clone from './clone';

module.exports = function(config={}, remoteConfig={}){
  const conf = {
    ...clone(config),
    services: clone(remoteConfig.settings)
  }
  return function(key){
    if(!key){ return clone(conf) }
    return clone(_.get(conf, key))
  }
}
