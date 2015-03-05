var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');

var RemoteHeaderActions = {
  clearHeader: function(header){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_HEADER,
      header:header
    });
  },
  setTokenHeader  :function(value){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.SET_TOKEN_HEADER,
      value:value
    });
  },
  setAppIdHeader  :function(value){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.SET_APP_ID_HEADER,
      value:value
    });
  },
  setUserIdHeader : function(value){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.SET_USER_ID_HEADER,
      value:value
    });
  },
  setHeader: function(header,value){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.SET_HEADER,
      header:header,
      value:value
    });
  }
};

module.exports = RemoteHeaderActions;
