/**
 * # Identity
 *
 * Allow users to log in with auth services that you have hooked on your app.
 *
 * ## Examples
 *
 *     <div data-hull-widget="identity@hull"></div>
 *     <div data-hull-widget="identity@hull" data-hull-provider="instagram"></div>
 *     <div data-hull-widget="identity@hull" data-hull-provider="facebook"></div>
 *     <div data-hull-widget="identity@hull" data-hull-provider="github"></div>
 *     <div data-hull-widget="identity@hull" data-hull-provider="github,facebook"></div>
 *
 * ## Options
 *
 * - `provider`: Optional, One or more providers to allow auth onto. If none specified, will default to show all configured providers for the app.
 * 
 * ## Template
 *
 * - `identity`: Show loggin buttons if the user isn't logged, display his name
 *   if he is.
 */
define({
  type: 'Hull',

  templates: [
    'identity'
  ],

  options:{
    provider:''
  },

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.authServices = _.map(this.sandbox.config.services.types.auth, function(s) {
      return s.replace(/_app$/, '');
    });

    if (_.isEmpty(this.authServices)) {
      console.error('No Auth services configured. please add one to be able to authenticate users.');
    }
  },

  beforeRender: function(data) {
    if(this.options.provider){
      data.providers = this.options.provider.replace(' ','').split(',');
      data.loggedOut = (this.loggedIn()) ? _.difference(data.providers, _.keys(this.loggedIn())) : data.providers;
    } else {
      data.providers = this.authServices || [];
    }
    data.loggedInNames = _.keys(this.loggedIn());
    return data;
  }
});
