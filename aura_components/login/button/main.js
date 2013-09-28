/**
 * Allow users to log in with auth services that you have hooked on your app.
 * For a more complete component, look at the Identity component.
 *
 * @name Login button
 * @param {String} provider Optional. One or more providers to log users in. If none specified, will show all configured providers for the app.
 * @example <div data-hull-component="login/button@hull"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="instagram"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="facebook"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="github"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="github,facebook"></div>
 */

Hull.define({
  type: 'Hull',

  templates: [
    'button'
  ],

  options:{
    provider:''
  },

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.authServices = this.sandbox.util._.map(this.sandbox.config.services.types.auth, function(s) {
      return s.replace(/_app$/, '');
    });

    if (this.sandbox.util._.isEmpty(this.authServices)) {
      console.error('No Auth services configured. please add one to be able to authenticate users.');
    }
  },

  beforeRender: function(data) {

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
    data.matchingProviders = this.sandbox.util._.intersection(data.providers, data.loggedInProviders);
    data.authServices = this.authServices;

    return data;
  }
});
