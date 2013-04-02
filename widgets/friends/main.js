/**
 * # Friends
 *
 * Displays friends for a given user and a given service.
 *
 * ## Example
 *
 *     <div data-hull-widget="friends_list@hull"></div>
 *
 * ## Options
 *
 * - `id`: Optional, the id of the user whose friends we want to list. By default, it will list the friends of the current user.
 * - `provider`: Optional, service from which we will fetch friends. Can be `hull`, `current`, `instagram`, `twitter`, `facebook` or `github`, by default it will list friends from `hull`. If you specify `current`, will fetch friends from the provider which the user has used to login.
 * - `limit`: Optional, the number of friends to display. Be default it will display 10 friends.
 *
 * ## Template
 *
 * - `friends`: Displays the list of the user's friends.
 *
 * ## Datasource
 *
 * - `friends`: The user's friends.
 */
define(['underscore'], {
  type: 'Hull',

  templates: [
    'friends'
  ],

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.limit = this.options.limit || 10;
  },

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

        if(provider=='current'){
          provider = _.keys(user.identities)[0]
        }

        if (provider === 'twitter' && !this.loggedIn().twitter) {
          return deferred.resolve([]);
        } else if (provider === 'hull' || user.identities[provider]) {
          return this.request(provider, user).then(_.bind(function(res) {
            var friends = this.serializers[provider](res).slice(0, this.limit);
            deferred.resolve(friends);
          }, this));
        } else {
          return deferred.resolve([]);
        }
      }, this));

      return deferred.promise();
    }
  },

  request: function(provider, user) {
    var path, params;

    switch (provider) {
      case 'hull':
        path = 'hull/' + user.id + '/friends';
        params = { per_page: this.limit };
        break;
      case 'facebook':
        path = 'facebook/' + user.identities.facebook.uid + '/friends';
        params = { limit: this.limit };
        break;
      case 'twitter':
        path = 'twitter/friends/list';
        params = { user_id: user.identities.twitter.uid };
        break;
      case 'github':
        path = 'github/users/' + user.identities.github.login + '/following';
        params = { per_page: this.limit };
        break;
    }

    return this.api(path, params);
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

    twitter: function(res) {
      return _.map(res.users, function(f) {
        return {
          provider: 'twitter',
          name: f.name,
          avatar: f.profile_image_url
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
