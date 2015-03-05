var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');

var RemoteUserActions = {
  clear: function(){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_USER
    });
  },
  update: function(user){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_USER,
      user:user
    });
  },
  updateIfMe: function(data){
    // We don't know if it's a Me object. for now it's just a bundle of data from the API.
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_USER_IF_ME,
      data:data
    });
  },
};

module.exports = RemoteUserActions;
