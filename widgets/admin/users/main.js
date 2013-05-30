/**
 * Widget Users - Admin access only
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
    users: function() {
      return this.api(this.appId + '/users', this.params);
    }
  },

  beforeRender: function(data){
    _.each(data.users, function(profile){
      _.each(profile.user.identities,function(identity){
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
    }

  }
});
