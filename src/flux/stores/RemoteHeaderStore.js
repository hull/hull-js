var EventEmitter     = require('events').EventEmitter;
var assign           = require('object-assign');
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

      case RemoteConstants.UPDATE_SETTINGS:
        // When Settings Change, we need to update our AccessToken Header accordingly
        if(action && action.settings && action.settings.auth && action.settings.auth.hull && action.settings.auth.hull.credentials){
          var accessToken = action.settings.auth.hull.credentials.access_token;

          // We're not logged in anymore probably : destroy the token
          if(!accessToken){
            destroyHeader(ACCESS_TOKEN_HEADER);
            RemoteHeaderStore.emitChange(action.actionType);
          } else if(!!accessToken && accessToken !== getHeader(ACCESS_TOKEN_HEADER)){
            // Token is actually different from the previous one (including empty) -> Emit change.
            setHeader(ACCESS_TOKEN_HEADER,accessToken);
            RemoteHeaderStore.emitChange(action.actionType);
          }

          break;
        }

      case RemoteConstants.UPDATE_USER:
        setHeader(ACCESS_TOKEN_HEADER,action.value);
        RemoteHeaderStore.emitChange(action.actionType);
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

      case RemoteConstants.SET_APP_ID_HEADER:
        setHeader(APP_ID_HEADER,action.value);
        RemoteHeaderStore.emitChange(action.actionType);
        break;

      case RemoteConstants.SET_USER_ID_HEADER:
        setHeader(USER_ID_HEADER,action.value)
        if(!RemoteUserStore.isId(action.value)){destroyHeader(ACCESS_TOKEN_HEADER)}
        RemoteHeaderStore.emitChange(action.actionType);
        break;
    }
    return true;
  })

});

module.exports = RemoteHeaderStore;
