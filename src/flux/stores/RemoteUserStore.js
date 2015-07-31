var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {
  user:null,
};

var isSameId = function(value){
  return value === (state.user && state.user.id);
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
  isSameId                : isSameId,
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
          if(!action.options.silent===true){
            RemoteUserStore.emitChange(action.actionType);
          }
        }
        break;
    }
    return true;
  })

});

module.exports = RemoteUserStore;
