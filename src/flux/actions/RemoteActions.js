var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');
var RemoteUserStore = require('../stores/RemoteUserStore');

var RemoteSettingsActions = {
  updateClientConfig: function(config){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_CLIENT_CONFIG,
      config: config
    });
  },
  updateRemoteConfig: function(config, options={}){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_REMOTE_CONFIG,
      config: config,
      options:options
    });
  },
  updateServices: function(services, options={}){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_SERVICES,
      services: services,
      options:options
    });
  },
  logoutUser: function(options={}){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.LOGOUT_USER,
      options: options
    });
  },
  updateUser: function(user, options={}){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_USER,
      user:user,
      options:options
    });
  },
  updateUserIfMe: function(data){
    // We don't know if it's a Me object. for now it's just a bundle of data from the API.
    if(data.body && RemoteUserStore.isSameId(data.body.id)){
      RemoteDispatcher.handleAction({
        actionType: RemoteConstants.UPDATE_USER,
        user:data.body
      });
    }
  }
};

module.exports = RemoteSettingsActions;
