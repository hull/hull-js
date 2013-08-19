/**
 * ## Identity
 *
 * Allow users to log in with auth services that you have hooked on your app.
 * When logged in, show a micro-profile card.
 *
 * ### Examples
 *
 *     <div data-hull-component="identity@hull"></div>
 *     <div data-hull-component="identity@hull" data-hull-provider="instagram"></div>
 *     <div data-hull-component="identity@hull" data-hull-provider="facebook"></div>
 *     <div data-hull-component="identity@hull" data-hull-provider="github"></div>
 *     <div data-hull-component="identity@hull" data-hull-provider="github,facebook"></div>
 *
 * ### Options
 *
 * - `provider`: Optional, One or more providers to log users in.
 *   If none specified, will show all configured providers for the app.
 *
 * ### Template
 *
 * - `identity`: Show login buttons if the user isn't logged, display a micro profile card if he is.
 *
 */
Hull.define({
  type: 'Hull',

  templates: [
    'identity'
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

    this.authServices = this.sandbox.util._.map(this.sandbox.config.services.types.auth, function(s) {
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
