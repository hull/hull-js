/**
 *
 * ## User list
 *
 * Displays the list of the users of your app.
 * The access to this component is limited to the administrators, you will need the Spplication Secret
 * to have access to the data.
 *
 * ### Example
 *
 *     <div data-hull-component="admin/users@hull" app-id="app"></div>
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

  templates: ['users'],

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: 'users'
  },

  beforeRender: function(data){
    var datasource = this.datasources.users;

    data.showPagination = datasource.isPaginable();
    data.showNextButton = !datasource.isLastPage();
    data.showPreviousButton = !datasource.isFirstPage();

    return data;
  },

  actions: {
    nextPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isLastPage()) {
        datasource.nextPage();
        this.render();
      }
    },

    previousPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isFirstPage()) {
        datasource.previousPage();
        this.render();
      }
    },

    selectUser: function(event, action) {
      this.sandbox.emit('hull-admin.user.select', action.data.id);
      event.preventDefault();
    }
  }
});
