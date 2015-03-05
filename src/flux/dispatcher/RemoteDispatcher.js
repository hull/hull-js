var flux = require('flux');
var assign = require('object-assign');


var RemoteDispatcher = assign(new flux.Dispatcher(), {
  handleAction: function(action) {
    this.dispatch({action:action});
  },
});

module.exports = RemoteDispatcher;
