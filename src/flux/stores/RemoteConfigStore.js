var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {
  clientConfig: {},
  remoteConfig: {}
};

var RemoteConfigStore = assign({}, EventEmitter.prototype, {
  emitChange          : function() {this.emit(CHANGE_EVENT); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getState            : function() {return state;},
  getAuthSetting      : function(provider) {
    if(state && state.remoteConfig && state.remoteConfig.settings && state.remoteConfig.settings.auth && state.remoteConfig.settings.auth[provider]){
      return state.remoteConfig.settings.auth[provider]
    }
    return undefined
  },

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case RemoteConstants.UPDATE_CLIENT_CONFIG:
        state.clientConfig = action.config
        RemoteConfigStore.emitChange();
        break;
      case RemoteConstants.UPDATE_REMOTE_CONFIG:
        state.remoteConfig = action.config
        RemoteConfigStore.emitChange();
        break;
    }
    return true;
  })

});

module.exports = RemoteConfigStore;
