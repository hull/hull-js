/**
 *
 * Allow users to log in with auth services that you have hooked on your app.
 * When logged in, show a micro-profile card.
 *
 * @name Profile
 * @param {String} provider  Optional, One or more providers to log users in. If none specified, will show all configured providers for the app.
 * @template {identity} Show login buttons if the user isn't logged, display a micro profile card if he is.
 * @example <div data-hull-component="login/profile@hull"></div>
 * @example <div data-hull-component="login/profile@hull" data-hull-provider="instagram"></div>
 * @example <div data-hull-component="login/profile@hull" data-hull-provider="facebook"></div>
 * @example <div data-hull-component="login/profile@hull" data-hull-provider="github"></div>
 * @example <div data-hull-component="login/profile@hull" data-hull-provider="github,facebook"></div>
 */

Hull.component({
  type: 'Hull',

  templates: [
    'profile'
  ],

  options:{
    provider:''
  },

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    "use strict";
    this.authHasFailed = false;
    var configuredProviders = this.sandbox.login.available();
    var _ = this.sandbox.util._;

    this.sandbox.on('hull.auth.failure', _.bind(function() {
      this.authHasFailed = true;
      this.render();
    }, this));

    if (_.isEmpty(configuredProviders)) {
      console.error('No Auth services configured. please add one to be able to authenticate users.');
    }

    // If providers are specified, then use only those. else use all configuredauthServices
    if (this.options.provider) {
      var authServices = this.options.provider.replace(' ','').split(',');
    } else {
      var authServices = configuredProviders || [];
    }

    this.configuredProviders = _.filter(authServices, function (provider) {
      if (!this.sandbox.login.available(provider)) {
        console.error('No auth service configured for ' + provider);
        return false;
      }
      return true;
    }, this);
  },

  beforeRender: function(data) {
    "use strict";
    data.authHasFailed = this.authHasFailed;
    var _ = this.sandbox.util._;

    // If I'm logged in, then create an array of logged In providers
    if(this.loggedIn()){
      data.loggedInProviders = _.keys(this.loggedIn());
    } else {
      data.loggedInProviders = [];
    }

    // Create an array of logged out providers.
    data.loggedOut = _.difference(this.configuredProviders, data.loggedInProviders);
    data.matchingProviders = _.intersection(this.configuredProviders.concat('email'), data.loggedInProviders);
    data.authServices = this.configuredProviders;

    return data;
  },

  afterRender: function() {
    this.authHasFailed = false;
  }
});
