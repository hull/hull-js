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
 * - `provider`: Optional, service from which we will fetch friends. Can be `hull`, `current`, `instagram`, `twitter`, `facebook` or `github`, by default it will list friends from `hull`.  
 *   `hull` will show the user's friends who also have interacted with the app.  
 *   `current` will show all friends from the provider which the user has used to login.
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

  options: {
    id:'me',
    provider:'hull',
    limit: 10
  },


  refreshEvents: ['model.hull.me.change'],

  datasources: {
    friends: function() {
      var deferred = this.sandbox.data.deferred();

      var provider = this.options.provider

      // If we're using an external provider, then the user will be us.
      var user_id = (provider!=='hull')?'me':this.options.id

      this.api('hull/' + user_id).then(_.bind(function(user) {

        // render null if we don't have any identity on this user.
        if (user.identities === null || user.identities === undefined) {
          return deferred.resolve([]);
        }

        // map the user identities by name
        user.identities = _.reduce(user.identities, function(m, i) {
          m[i.provider] = i;
          return m;
        }, {});

        // If we specified "current" as the provider, then use the first identity
        if(provider==='current'){
          provider = _.keys(user.identities)[0]
        }

        if (provider === 'hull' || user.identities[provider]){
          return this.request(provider, user, this.options).then(_.bind(function(res) {
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

  request: function(provider, user, options) {
    var path, params;

    switch (provider) {
      case 'hull':
        path = 'hull/' + ((options.id==='me')?'me':user.id) + '/friends';
        params = { per_page: this.options.limit };
        break;
      case 'facebook':
        path = 'facebook/' + ((options.id==='me')?user.identities.facebook.uid:options.id) + '/friends';
        params = { limit: this.options.limit };
        break;
      case 'twitter':
        path = 'twitter/friends/list';
        params = { user_id: ((options.id==='me')?user.identities.twitter.uid:options.id) };
        break;
      case 'instagram':
        path = 'instagram/users/'+((options.id==='me')?'self':options.id)+'/follows';
        params = { per_page: this.options.limit };
        break;
      case 'github':
        path = 'github/users/' + ((options.id==='me')?user.identities.github.login:options.id) + '/following';
        params = { per_page: this.options.limit };
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
          avatar: f.picture,
          uid: f.id
        };
      });
    },

    facebook: function(res) {
      return _.map(res.data, function(f) {
        return {
          provider: 'facebook',
          name: f.name,
          avatar: 'http://graph.facebook.com/' + f.id + '/picture',
          uid: f.id
        };
      });
    },

    twitter: function(res) {
      return _.map(res.users, function(f) {
        return {
          provider: 'twitter',
          name: f.name,
          avatar: f.profile_image_url,
          uid: f.id
        };
      });
    },

    instagram: function(res){
      return _.map(res, function(f){
        return {
          provider: 'instagram',
          name: f.full_name,
          avatar: f.profile_picture,
          uid: f.id
        }
      });
    },

    github: function(res) {
      return _.map(res, function(f) {
        return {
          provider: 'github',
          name: f.login,
          avatar: f.avatar_url,
          id: f.id
        };
      });
    }
  }
});
