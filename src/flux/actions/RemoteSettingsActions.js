var RemoteDispatcher= require('../dispatcher/RemoteDispatcher');
var RemoteConstants = require('../constants/RemoteConstants');

var RemoteUserActions = {
  clear: function(){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.CLEAR_SETTINGS
    });
  },
  update: function(settings){
    RemoteDispatcher.handleAction({
      actionType: RemoteConstants.UPDATE_SETTINGS,
      settings: settings
    });
  }
};

module.exports = RemoteUserActions;
