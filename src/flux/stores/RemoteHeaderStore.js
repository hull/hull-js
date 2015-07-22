var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');
var RemoteUserStore  = require('../stores/RemoteUserStore');

var CHANGE_EVENT = 'change';
var ACCESS_TOKEN_HEADER = 'Hull-Access-Token';
var USER_ID_HEADER = 'Hull-User-Id';
var APP_ID_HEADER = 'Hull-App-Id';

var state = {
  headers: {
    'Accept':'application/json',
    'Content-Type':'application/json'
  }
};
function getHeader(header) {
  return state.headers[header];
}
function setHeader(header,value) {
  state.headers[header] = value;
}
function destroyHeader(header) {
  delete state.headers[header];
}

var RemoteHeaderStore = assign({}, EventEmitter.prototype, {
  emitChange          : function(change) {this.emit(CHANGE_EVENT, change); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getState            : function() {return state.headers;},
  getHeader           : function(h) {return state.headers[h];},

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;
    switch(action.actionType) {

      case RemoteConstants.UPDATE_REMOTE_CONFIG:
        // When Settings Change, we need to update our AccessToken Header accordingly
        if(action){
          var accessToken = action.config.access_token || (action.config && action.config.settings && action.config.settings.auth && action.config.settings.auth.hull && action.config.settings.auth.hull.credentials && action.config.settings.auth.hull.credentials.access_token);
          // We're not logged in anymore probably : destroy the token
          if(!accessToken){
            destroyHeader(ACCESS_TOKEN_HEADER);
            RemoteHeaderStore.emitChange(action.actionType);
          } else if(!!accessToken && accessToken !== getHeader(ACCESS_TOKEN_HEADER)){
            // Token is actually different from the previous one (including empty) -> Emit change.
            setHeader(ACCESS_TOKEN_HEADER,accessToken);
            RemoteHeaderStore.emitChange(action.actionType);
          }

          if(action.config && action.config.appId){
            setHeader(APP_ID_HEADER, action.config.appId);
          }

        }
        break;

      case RemoteConstants.UPDATE_USER:
        if (action.user && action.user.access_token){
          setHeader(ACCESS_TOKEN_HEADER,action.user.access_token);
          RemoteHeaderStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.CLEAR_USER_TOKEN:
        if(getHeader(ACCESS_TOKEN_HEADER)){
          destroyHeader(ACCESS_TOKEN_HEADER);
          RemoteHeaderStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.UPDATE_USER_IF_ME:
        var id = action.data.headers && action.data.headers[USER_ID_HEADER];
        if (id){
          setHeader(USER_ID_HEADER, id)

          // If the call returns the current a user profile 
          if (RemoteUserStore.isSameId(id)) {
            // If we have an access token in there, update it.
            if(action.data.body && action.data.body.access_token){
              setHeader(ACCESS_TOKEN_HEADER, action.data.body.access_token)
            }
          } else {
            destroyHeader(ACCESS_TOKEN_HEADER);
          }
          RemoteHeaderStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.CLEAR_HEADER:
        destroyHeader(action.header);
        RemoteHeaderStore.emitChange(action.actionType);
        break;

      case RemoteConstants.SET_HEADER:
        if(!RemoteUserStore.isUpToDate(action.user)){
          setHeader(action.header,action.value);
          RemoteHeaderStore.emitChange();
        }
        break;

    }
    return true;
  })

});

module.exports = RemoteHeaderStore;
