var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {};

var ClientConfigStore = assign({}, EventEmitter.prototype, {
  emitChange          : function() {this.emit(CHANGE_EVENT); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getState            : function() {return state;},

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case RemoteConstants.UPDATE_CLIENT_CONFIG:
        state = action.config
        ClientConfigStore.emitChange();
        break;
    }
    return true;
  })

});

module.exports = ClientConfigStore;
