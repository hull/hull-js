/**
 * ## User profile
 *
 * Displays the profile of an user of your app.
 *
 * ### Example
 *
 *     <div data-hull-component="admin/user_profile@hull"></div>
 *
 * ### Options
 *
 * - `id`: The is of the user you want to display
 *
 * ### Template
 *
 * - `user_profile`: Displays detailed informations about the selected user.
 *
*/
Hull.define({
  type: 'Hull',

  templates: [
    'profile'
  ],

  datasources: {
    user: function() {
      if (this.user) { return this.api(this.user, { fields: 'user.profiles' }); }
    }
  },

  initialize: function() {
    this.sandbox.on('hull.user.select', this.renderUser, this);
  },

  beforeRender: function(data){
    if (!data.user) { return; }

    data.userHasProfiles = !this.sandbox.util._.isEmpty(data.user.profiles);
  },

  actions: {
    promote: function(e, action) {
      this.promoteUser(action.data.role);
    },

    approve: function() {
      var self = this;
      this.api(this.data.user.id + '/approve', 'post').then(function() {
        self.render();
      });
    },

    unapprove: function() {
      var self = this;
      this.api(this.data.user.id + '/unapprove', 'post').then(function() {
        self.render();
      });
    }
  },

  renderUser: function(id) {
    var displayedUser = this.data.user;
    if (displayedUser && displayedUser.id === id) { return; }

    this.user = id;
    this.render();
  },

  promoteUser: function(role) {
    var method = role === 'admin' ? 'post' : 'delete';
    var self = this;
    this.api('admins/' + this.data.user.id, method).then(function() {
      self.render();
    });
  }
});
