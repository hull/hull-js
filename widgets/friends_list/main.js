/**
 * # Friends List
 *
 * Displays the list of your friends in the application.
 *
 * ## Example
 *
 *     <div data-hull-widget="friends_list@hull"></div>
 *
 * ## Option
 *
 * - `id`: Optional, the id of the user whose friends we want to list. By default, it will list the friends of the current user.
 *
 * ## Template
 *
 * - `friends_list`: Displays the list of the user's friends.
 *
 * ## Datasource
 *
 * - `friends`: Specify how the list should be displayed
 */
define({
  type: 'Hull',

  templates: [
    'friends_list'
  ],

  datasources: {
    friends: ':id/friends'
  },

  initialize: function() {
    if (!this.options.id) {
      this.options.id = 'me';
    }
  }
});
