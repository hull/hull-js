var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');

var RemoteSettingsActions = {
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
  },
  clearHeader: function(header){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_HEADER,
      header:header
    });
  },
  setHeader: function(header,value){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.SET_HEADER,
      header:header,
      value:value
    });
  },
  clearUser: function(){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_USER
    });
  },
  clearUserToken: function(){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_USER_TOKEN,
      user:user
    });
  },
  updateUser: function(user){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_USER,
      user:user
    });
  },
  updateUserIfMe: function(data){

    // We don't know if it's a Me object. for now it's just a bundle of data from the API.
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_USER_IF_ME,
      data:data
    });
  }
};

module.exports = RemoteSettingsActions;
