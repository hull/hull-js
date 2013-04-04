/**
 * Widget Users - Admin access only
 *
 * Not ready yet
 */

define({
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
    userProfiles: function() {
      return this.api('hull/' + this.appId + '/users', this.params);
    }
  },

  beforeRender: function() {
    console.warn("Before Render !");
  },

  actions: {
    nextPage: function() {
      this.params.page += 1;
      this.render();
    },

    previousPage: function() {
      this.params.page -= 1;
      this.render();
    }
  }


});
