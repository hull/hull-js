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


    this.sandbox.on('hull.auth.failure', this.sandbox.util._.bind(function() {
      this.authHasFailed = true;
      this.render();
    }, this));

    this.authServices = this.sandbox.util._.map(this.sandbox.util._.keys(this.sandbox.config.services.auth), function(s) {
      return s.replace(/_app$/, '');
    });

    if (this.sandbox.util._.isEmpty(this.authServices)) {
      console.error('No Auth services configured. please add one to be able to authenticate users.');
    }

  },

  beforeRender: function(data) {
    "use strict";

    data.authHasFailed = this.authHasFailed;

    // If providers are specified, then use only those. else use all configuredauthServices
    if(this.options.provider){
      data.providers = this.options.provider.replace(' ','').split(',');
    } else {
      data.providers = this.authServices || [];
    }

    // If I'm logged in, then create an array of logged In providers
    if(this.loggedIn()){
      data.loggedInProviders = this.sandbox.util._.keys(this.loggedIn());
    } else {
      data.loggedInProviders = [];
    }

    // Create an array of logged out providers.
    data.loggedOut = this.sandbox.util._.difference(data.providers, data.loggedInProviders);
    data.matchingProviders = this.sandbox.util._.intersection(data.providers.concat('email'), data.loggedInProviders);
    data.authServices = this.authServices;

    return data;
  },

  afterRender: function() {
    this.authHasFailed = false;
  }
});
