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
define(['underscore'], {
  type: 'Hull',

  templates: [
    'friends'
  ],

  datasources: {
    friends: function() {
      var deferred = this.sandbox.data.deferred();

      this.api('hull/' + (this.options.id || 'me')).then(_.bind(function(user) {
        if (user.identities === null || user.identities === undefined) {
          return deferred.resolve([]);
        }

        user.identities = _.reduce(user.identities, function(m, i) {
          m[i.provider] = i;
          return m;
        }, {});

        var provider = this.options.provider || 'hull';
        if (provider === 'hull' || user.identities[provider]) {
          return this.api(this.paths[provider](user)).then(_.bind(function(res) {
            deferred.resolve(this.serializers[provider](res));
          }, this));
        } else {
          return deferred.resolve([]);
        }
      }, this));

      return deferred.promise();
    }
  },

  paths: {
    hull: function(user) {
      return 'hull/' + user.id + '/friends';
    },

    facebook: function(user) {
      var identity = user.identities.facebook;
      return 'facebook/' + identity.uid + '/friends';
    },

    github: function(user) {
      var identity = user.identities.github;
      return 'github/users/' + identity.login + '/following';
    }
  },

  serializers: {
    hull: function(res) {
      return _.map(res, function(f) {
        return {
          provider: 'hull',
          name: f.name,
          avatar: f.picture
        };
      });
    },

    facebook: function(res) {
      return _.map(res.data, function(f) {
        return {
          provider: 'facebook',
          name: f.name,
          avatar: 'http://graph.facebook.com/' + f.id + '/picture'
        };
      });
    },

    github: function(res) {
      return _.map(res, function(f) {
        return {
          provider: 'github',
          name: f.login,
          avatar: f.avatar_url
        };
      });
    }
  }
});
