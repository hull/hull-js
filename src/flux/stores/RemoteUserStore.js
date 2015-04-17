var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {
  user:null,
};

var isId = function(value){
  return value === state.user.id;
}

var isUpToDate = function(user){
  if(!user && !state.user){return true}
  return user && state.user && user.updated_at===state.user.updated_at
}

var RemoteUserStore = assign({}, EventEmitter.prototype, {
  emitChange          : function(changeEvent) {this.emit(CHANGE_EVENT, changeEvent); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getState            : function() {return state;},
  isId                : isId,
  isUpToDate          : isUpToDate,

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case RemoteConstants.CLEAR_USER:
        state.user     = null
        RemoteUserStore.emitChange(action.actionType);
        break;

      case RemoteConstants.UPDATE_USER:
        if(!isUpToDate(action.user)){
          state.user = action.user
          RemoteUserStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.UPDATE_USER_IF_ME:
        // Updates a User if it's a Me request.
        if(isId(action.data.id) && !isUpToDate(action.data)){
          state.user = action.data
          RemoteUserStore.emitChange(action.actionType);
        }
        break;
    }
    return true;
  })

});

module.exports = RemoteUserStore;
