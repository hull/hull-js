/**
 * # Images
 *
 * Displays pictures belonging to a given user on a given service
 *
 * ## Example
 *
 *     <div data-hull-widget="pictures@hull"></div>
 *
 * ## Options
 *
 * - `id`: Optional, the id of the user whose pictures we want to list. By default, it will list the pictures of the current user.
 * - `provider`: Optional, service from which we will fetch pictures. Can be `hull`, `current`, `instagram`, or `facebook`, by default it will list pictures from `hull`.  
 *   `hull` will show the user's pictures who also have interacted with the app.  
 *   `current` will show all pictures from the provider which the user has used to login.
 * - `limit`: Optional, the number of pictures to display. Be default it will display 10 pictures.
 *
 * ## Template
 *
 * - `pictures`: Displays the list of the user's pictures.
 *
 * ## Datasource
 *
 * - `pictures`: The user's pictures.
 */
define(['underscore'], {
  type: 'Hull',

  templates: [
    'pictures'
  ],

  options: {
    id:'me',
    provider:'hull',
    limit: 10
  },

  refreshEvents: ['model.hull.me.change'],

  datasources: {
    pictures: function() {
      var deferred = this.sandbox.data.deferred();

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
            var pictures = this.serializers[provider](res).slice(0, this.limit);
            deferred.resolve(pictures);
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
        path = 'hull/' + ((id==='me')?'me':user.id) + '/images';
        params = { per_page: this.options.limit };
        break;
      case 'facebook':
        path = 'facebook/' + ((id==='me')?user.identities.facebook.uid:id) + '/photos';
        params = { limit: this.options.limit };
        break;
      case 'instagram':
        path = 'instagram/users/'+((id==='me')?'self':id)+'/media/recent';
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
          picture: "//" + Hull.config.assetsUrl + "/img/" + f.id
        };
      });
    },

    facebook: function(res) {
      return _.map(res.data, function(f) {
        return {
          provider: 'facebook',
          name: f.name,
          picture: f.source,
          uid: f.id
        };
      });
    },

    instagram: function(res){
      return _.map(res, function(f){
        var t = ""
        if(f && f.caption){t = f.caption.text}
        return {
          provider: 'instagram',
          name: t,
          picture: f.images.low_resolution.url,
          uid: f.id
        }
      });
    }
  }
});
