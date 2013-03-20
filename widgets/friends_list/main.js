/**
 * # Friends List
 *
 * Displays the list of your friends in the application.
 *
 * ## Templates
 *
 * - `friends_list`: Displays the list of the user's friends using the application
 *
 * ## Datasources
 *
 * - `friends`: Specify how the list should be displayed
 */
define({
  type: 'Hull',
  templates: ['friends_list'],
  datasources: {
    friends: ':id/friends'
  },
  initialize: function() {
    if (!this.options.id) {
      this.options.id = 'me';
    }
  }
});
