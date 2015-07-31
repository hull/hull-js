var EventEmitter     = require('events').EventEmitter;
var assign           = require('../../polyfills/assign');
var RemoteDispatcher = require('../dispatcher/RemoteDispatcher');
var RemoteConstants  = require('../constants/RemoteConstants');

var CHANGE_EVENT = 'change';

var state = {};

var RemoteConfigStore = assign({}, EventEmitter.prototype, {
  emitChange          : function(changeEvent) {this.emit(CHANGE_EVENT, changeEvent); },
  addChangeListener   : function(callback) {this.on(CHANGE_EVENT, callback); },
  removeChangeListener: function(callback) {this.removeListener(CHANGE_EVENT, callback); },
  getAuth             : function(provider) {
    if(state && state.settings && state.settings.auth && state.settings.auth[provider]){
      return state.settings.auth[provider]
    }
    return undefined
  },
  getHullToken        : function(){ return state.access_token; },
  getState            : function(){ return state; },

  dispatcherIndex: RemoteDispatcher.register(function(payload) {
    var action = payload.action;
    var text;

    switch(action.actionType) {
      case RemoteConstants.UPDATE_REMOTE_CONFIG:
        state = action.config
        if(!action.options.silent===true){
          RemoteConfigStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.UPDATE_SETTINGS:
        state.services = action.services;
        if(!action.options.silent===true){
          RemoteConfigStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.UPDATE_USER:
        state.access_token = action.user.access_token
        if(!action.options.silent===true){
          RemoteConfigStore.emitChange(action.actionType);
        }
        break;

      case RemoteConstants.LOGOUT_USER:
        delete state.access_token
        if(state.settings && state.settings.auth){
          _.map(state.settings, function(services, type){
            _.map(services, function(service, key){
              delete service.credentials
              // Since Hull Storage doesnt have the same format as the others :(
              if(type==='storage'){ delete service.params }
            });
          });
        }
        if(!action.options.silent===true){
          RemoteConfigStore.emitChange(action.actionType);
        }
        break;

    }
    return true;
  })

});

module.exports = RemoteConfigStore;
