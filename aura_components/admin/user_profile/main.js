/**
 *
 * Displays the profile of any user of your app.
 *
 * @name User Profile
 * @template {user_profile} Displays detailed informations about the selected user.
 * @param {String} id The id of the user you want to display
 * @example <div data-hull-component="admin/user_profile@hull"></div>
 *
 */
Hull.component({
  type: 'Hull',

  templates: [
    'user_profile'
  ],

  datasources: {
    user: function() {
      if (this.options.id) {
        return this.api({
          provider: 'admin@' + this.options.namespace,
          path: this.options.id
        }, {
          fields: 'user.profiles'
        });
      }
    },
    badges: function() {
      if (this.options.id) {
        return this.api({
          provider: 'admin@' + this.options.namespace,
          path: this.options.id + '/badges'
        });
      }
    }
  },

  initialize: function() {
    this.sandbox.on('hull.user.select', this.renderUser, this);
    this.injectLinkTag(this.options.baseUrl + '/main.min.css');
  },

  /**
   *  @FIXME Duplicated from aura_components/login/shopify/main.js
   **/
  injectedLinkTags: {},
  injectLinkTag: function(url) {
    if (this.injectedLinkTags[url]) { return; }

    var e = document.createElement('link');
    e.href = url;
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.injectedLinkTags[url] = true;
  },

  beforeRender: function(data){
    if (!data.user) { return; }

    data.userHasProfiles = !this.sandbox.util._.isEmpty(data.user.profiles);
    data.user.name = data.user.name || 'Unknown name';
    data.user.email = data.user.email || 'Unknown email';
    data.user.username = data.user.username || 'No username';
    data.isEmail = data.user.main_identity === 'email';
    data.isGuest = data.user.main_identity === 'guest';
    data.identities = {};
    var self = this;
    this.sandbox.util._.each(data.user.identities, function (identity) {
      data.identities[identity.provider] = {
        login: identity.login,
        email: identity.email,
        profile: self.profileForIdentity(identity.provider, identity)
      };
    });
  },

  afterRender: function () {
    if (this.options.id) {
      this.sandbox.emit('hull.admin.user_profile.available');
      this.track('hull.admin.user_profile.show', {
        target_user_id: this.options.id,
        user_id: this.data.me.id
      });
    }
  },

  profileForIdentity: function (provider, identity) {
    switch (provider.toLowerCase()) {
      case 'facebook':
        return 'http://www.facebook.com/' + (identity.uid || identity.login);
        break;
      case 'linkedin':
        return 'http://www.linkedin.com/profile/view?id=' + identity.uid;
        break;
      case 'twitter':
        return 'https://twitter.com/intent/user?user_id=' + identity.uid;
        break;
    }
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
    },

    deleteBadge: function(e, action) {
      var self = this;
      if (confirm("Sure ?")) {
        this.api({path: action.data.id, provider: 'admin@' + this.options.namespace}, 'delete', function(res) {
          self.render();
        });
      }
    }
  },

  renderUser: function(id) {
    var displayedUser = this.data.user;
    if (displayedUser && displayedUser.id === id) {
      this.sandbox.emit('hull.admin.user_profile.available');
    }
    this.options.id = id;
    this.user = id;
    this.render();
  },

  promoteUser: function(role) {
    var method = role === 'admin' ? 'post' : 'delete';
    var self = this;
    this.api({
      provider: 'admin@' + this.options.namespace,
      path: 'admins/' + this.data.user.id
    }, method).then(function() {
      self.render();
    });
  }
});
