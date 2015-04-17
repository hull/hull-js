var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {
  settings :{}
};

var RemoteSettingsStore = assign({}, EventEmitter.prototype, {
  emitChange          : function(changeEvent) {this.emit(CHANGE_EVENT, changeEvent); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getState            : function() {return state;},

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case RemoteConstants.CLEAR_SETTINGS:
        state.settings = null
        RemoteSettingsStore.emitChange(action.actionType);
        break;

      case RemoteConstants.UPDATE_SETTINGS:
        state.settings = action.settings
        RemoteSettingsStore.emitChange(action.actionType);
        break;
    }
    return true;
  })

});

module.exports = RemoteSettingsStore;
