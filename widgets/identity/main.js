/**
 * # Identity
 *
 * Allow users to log in with auth services that you have hooked on your app.
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
    data.authServices = this.authServices || [];
    return data;
  }
});
