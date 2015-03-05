var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');

var RemoteConfigActions = {
  updateClientConfig: function(config){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_CLIENT_CONFIG,
      config: config
    });
  },
  updateRemoteConfig: function(config){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_REMOTE_CONFIG,
      config: config
    });
  }
};

module.exports = RemoteConfigActions;
