Hull.define({
  type: 'Hull',
  templates: ['connect'],
  refreshEvents: ['model.hull.me.change'],
  beforeRender: function(data) {
    var _ = this.sandbox.util._,
            authServices = [],
            connected = this.loggedIn() || {},
            mainIdentity = data.me && data.me.main_identity;
    _.map(this.sandbox.config.services.types.auth, function(s) {
      var availableAction,
          name = s.replace(/_app$/, ''),
          isConnected = !!connected[name],
          canDisconnect = name !== mainIdentity;
      if (!isConnected) {
        availableAction = 'connect';
      } else if (canDisconnect) {
        availableAction = 'disconnect';
      }
      authServices.push({
        isConnected: isConnected,
        name: name,
        canDisconnect: canDisconnect,
        availableAction: availableAction
      });
    });
    console.warn("Auth Services...", authServices);
    data.authServices = authServices;
  }
});
