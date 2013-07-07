/**
 *
 * ## User list
 *
 * Displays the list of the users of your app.
 * The access to this widget is limited to the administrators, you will need the Spplication Secret
 * to have access to the data.
 *
 * ### Example
 *
 *     <div data-hull-widget="admin/users@hull" app-id="app"></div>
 *
 * ### Options
 *
 * - `app-id`: The id of the app you want to see the users. Defaults to `app`, which is the current app
 *
 * ### Template
 *
 * - `users`: Displays the list of the users.
 * - `forbidden`: A message to be displayed when the credentials don't allow access to the data
 *
*/

Hull.define({
  type: 'Hull',

  templates: ['users', 'forbidden'],

  appId: 'app',

  params: {
    page: 0,
    limit: 30
  },

  initialize: function() {
    if (this.options.appId) {
      this.appId = this.options.appId;
    }
  },

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: function() {
      return this.api(this.appId + '/users', this.params);
    }
  },

  beforeRender: function(data){
    var self = this;
    this.sandbox.util._.each(data.users, function(profile){
      self.sandbox.util._.each(profile.user.identities,function(identity){
        identity.type=identity.type.replace(/_(app|account)$/,'');
      });
    });
    return data;
  },

  actions: {
    nextPage: function() {
      this.params.page += 1;
      this.render();
    },

    previousPage: function() {
      this.params.page -= 1;
      this.render();
    },

    selectUser: function(event, action) {
      this.sandbox.emit('hull-admin.user.select', action.data.id);
      event.preventDefault();
    }

  }
});
