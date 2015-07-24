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
  clearAccessToken: function(){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_ACCESS_TOKEN,
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
    if(data.body && RemoteUserStore.isSameId(data.body.id)){
      RemoteDispatcher.handleAction({
        actionType: RemoteConstants.UPDATE_USER,
        user:data.body
      });
    }
  }
};

module.exports = RemoteSettingsActions;
