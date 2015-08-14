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
        if(action){
          if(action.config && action.config.appId){
            setHeader(APP_ID_HEADER, action.config.appId);
          }
        }
        break;

      case RemoteConstants.UPDATE_SETTINGS:
        if(action && action.services && action.services.auth && action.services.auth.hull && action.services.auth.hull.credentials){
          setHeader(ACCESS_TOKEN_HEADER, action.services.auth.hull.credentials.access_token);
        }
        break;

      case RemoteConstants.UPDATE_USER:
        if(action.user.id != getHeader(USER_ID_HEADER) || action.user.access_token != getHeader(ACCESS_TOKEN_HEADER)){
          if (action.user && action.user.access_token){
            setHeader(USER_ID_HEADER, action.user.id)
            setHeader(ACCESS_TOKEN_HEADER,action.user.access_token);
          } else {
            destroyHeader(ACCESS_TOKEN_HEADER);
            destroyHeader(USER_ID_HEADER);
          }
          RemoteHeaderStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.LOGOUT_USER:
        destroyHeader(ACCESS_TOKEN_HEADER);
        destroyHeader(USER_ID_HEADER);
        if(!action.options.silent===true){
          RemoteHeaderStore.emitChange(action.actionType);
        }
        break;

    }
    return true;
  })

});

module.exports = RemoteHeaderStore;
