var flux = require('flux');
var assign = require('../../polyfills/assign');


var RemoteDispatcher = assign(new flux.Dispatcher(), {
  handleAction: function(action) {
    this.dispatch({action:action});
  },
});

module.exports = RemoteDispatcher;
