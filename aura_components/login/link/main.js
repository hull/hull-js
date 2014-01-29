/**
 *
 * Allows a user to link secondary accounts to his primary account
 *
 * @name Link
 * @template {linking} The main template, shows buttons for other providers configured for the app and lets users link/unlink them
 * @example <div data-hull-component="login/link@hull"></div>
 */

Hull.component({
  type: 'Hull',
  templates: ['linking'],
  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.sandbox.on('hull.auth.login', function() {
      this.authHasFailed = false;
      this.render();
    }, this);

    this.sandbox.on('hull.auth.failure', function() {
      this.authHasFailed = true;
      this.render()
    }, this);
  },

  beforeRender: function(data) {
    var _ = this.sandbox.util._,
            authServices = [],
            connected = this.loggedIn() || {},
            mainIdentity = data.me && data.me.main_identity;
    _.map(this.sandbox.config.services.types.auth, function(s) {
      var availableAction, actionName,
          name = s.replace(/_app$/, ''),
          isConnected = !!connected[name],
          canDisconnect = name !== mainIdentity;
      if (!isConnected) {
        availableAction = 'linkIdentity';
        actionName = "link";
      } else if (canDisconnect) {
        availableAction = 'unlinkIdentity';
        actionName = "unlink";
      }
      authServices.push({
        isConnected: isConnected,
        name: name,
        canDisconnect: canDisconnect,
        availableAction: availableAction,
        actionName: actionName,
        identity: connected[name]
      });
    });
    data.authServices = authServices;
    data.authHasFailed = this.authHasFailed;
    this.authHasFailed = false;
  }
});
