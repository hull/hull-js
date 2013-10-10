/**
 * Allow users to log in with auth services that you have hooked on your app.
 * For a more complete component, look at the Identity component.
 *
 * @name Button
 * @param {String} provider Optional. One or more providers to log users in. If none specified, will show all configured providers for the app.
 * @example <div data-hull-component="login/button@hull"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="instagram"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="facebook"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="github"></div>
 * @example <div data-hull-component="login/button@hull" data-hull-provider="github,facebook"></div>
 */

Hull.component({
  type: 'Hull',

  templates: [
    'button'
  ],

  options:{
    provider:''
  },

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    var _ = this.sandbox.util._;
    var configuredProviders = this.sandbox.login.available();

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
    var _ = this.sandbox.util._;

    // If I'm logged in, then create an array of logged In providers
    if(this.loggedIn()){
      data.loggedInProviders = _.keys(this.loggedIn());
    } else {
      data.loggedInProviders = [];
    }

    // Create an array of logged out providers.
    data.loggedOut = _.difference(this.configuredProviders, data.loggedInProviders);
    data.matchingProviders = _.intersection(this.configuredProviders, data.loggedInProviders);
    data.authServices = this.configuredProviders;

    return data;
  }
});
