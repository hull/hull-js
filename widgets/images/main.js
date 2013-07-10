/**
 * ## Image list
 *
 * Displays images belonging to a given user on a given service
 *
 * ### Example
 *
 *     <div data-hull-widget="images@hull"></div>
 *
 * ### Options
 *
 * - `id`: Optional, the id of the user whose images we want to list. By default, it will list the images of the current user.
 * - `format`: Optional, the format of the thumbnail you wish to get. Can be `thumb`, `square`, `small`, `medium`, `large`, `original`. Will map to the closest existing preset when used on external networks. Default:  `small`
 * - `provider`: Optional, service from which we will fetch images. Can be `hull`, `instagram`, or `facebook`, by default it will list images from `hull`.
 * - `limit`: Optional, the number of images to display. Be default it will display 10 images.
 * - `scope` : Optional, a Facebook permission you need to ask the user before being able to show data. - If this permission is not given, a button will be shown to ask for it.
 *
 * ### Template
 *
 * - `images`: Displays the list of the user's images.
 *
 * ### Actions
 *
 * - `authorize`: Pops up a permissions dialog or a login dialog.
 *
 * ### Datasource
 *
 * - `images`: The user's images.
 * - `authorized` : A hash of permissions showing if the user can view the images.
 * Contains `provider`, `permissions` : Booleans showing if the provider and permissions are right,
 * and `provider_name` containing the name of the asked provider
 *
 */
Hull.define(['underscore'], {
  type: 'Hull',

  templates: [
    'images'
  ],

  options: {
    id:'me',
    provider:'hull',
    limit: 10,
    format: 'small',
    scope: 'user_photos'
  },

  refreshEvents: ['model.hull.me.change'],

  initialize: function() {
    this.me = this.sandbox.data.api.model('me');

    this.provider = this.options.provider;

    this.id = this.options.id || "me";
  },

  actions: {
    authorize: function(){
      if(this.provider==="facebook"){
        this.sandbox.login('facebook', {scope:this.options.scope}).then(this.sandbox.util._.bind(function(){
          this.render();
        },this));
      } else {
        this.sandbox.login(this.provider,{}).then(this.sandbox.util._.bind(function(){
          // this.render();
        },this));
      }
    }
  },


  datasources: {
    authorized: function() {
      return this.isAuthorized(this.provider);
    },

    images: function() {

      var deferred = this.sandbox.data.deferred();
      var self = this;

      // map identities by name
      var identities = this.sandbox.util._.reduce(this.me.get('identities'), function(m, i) {
        m[i.provider] = i;
        return m;
      }, {});

      //Are we logged in to provider, or is provider hull. if Provider is hull, are we asking "me" without being loggedin ?
      if( this.loggedIn()[this.provider] || (this.provider==="hull" && (this.loggedIn() || this.id!=="me"))){
        this.request(this.provider, identities, this.options).then(this.sandbox.util._.bind(function(res) {

          var serialized = this.sandbox.util._.bind(this.serializers[self.provider],this,res,this.options)
          var images = serialized().slice(0, this.options.limit)
          deferred.resolve(images);

        }, this));
      } else{
        deferred.resolve([]);
      }

      return deferred.promise();
    }

  },

  isAuthorized: function(provider){
    var deferred = this.sandbox.data.deferred();
    var self = this;
    var auth = {
      provider_name: provider,
      provider:false,
      permissions:false
    };

    if(provider==="hull"){
      auth.permissions = true;

      var valid = (this.loggedIn() || this.id!=="me");
      auth.provider = valid;

      var authProviders = this.sandbox.config.services.types.auth;
      if (!authProviders || !authProviders.length) {
        deferred.reject(new Error('No auth provider for this app'));
      } else {
        auth.provider_name = authProviders[0].replace(/_app$/,'');
        deferred.resolve(auth);
      }
    } else {
      if (this.loggedIn()[provider]){
        auth.provider=true;
        if(provider==='facebook'){
          this.hasFacebookPermissions(self.options.scope, auth, deferred);
        } else {
          auth.permissions=true;
          deferred.resolve(auth);
        }
      } else {
        auth.provider=false;
        deferred.resolve(auth);
      }

    }


    return deferred.promise();
  },
  hasFacebookPermissions: function(scope, authorization, deferred){
    "use strict";
    var _ = this.sandbox.util._;
    this.api({provider: "facebook", path: "me/permissions"}).then(function(res) {

      //Convert scope to array if given as a string.
      if(_.isString(scope)){
        scope = scope.replace(' ','').split(',');
      }

      if(_.isArray(scope) && (_.intersection(_.keys(res.data[0]), scope).length==scope.length)){
        //we have all the perms we need.
        authorization.permissions=true;
      }

      deferred.resolve(authorization);
    });
  },

  request: function(provider, identities, options) {
    "use strict";
    var path, params;

    switch (provider) {
      case 'hull':
        path = this.id + '/images';
        params = { per_page: this.options.limit };
        break;
      case 'facebook':
        path = {provider: 'facebook', path: this.id+'/photos/uploaded'};
        // path = 'facebook/' + ((this.id==='me')?identities.facebook.uid:this.id) + '/photos';
        params = { };
        break;
      case 'instagram':
        path = {provider: 'instagram', path: 'users/'+((this.id==='me')?'self':this.id)+'/media/recent'};
        params = { per_page: this.options.limit };
        break;
    }

    return this.api(path, params);
  },

  serializers: {
    hull: function(res, options) {
      "use strict";
      var sandbox = this.sandbox;
      return this.sandbox.util._.map(res, function(f) {
        return {
          provider: 'hull',
          name: f.name,
          picture: sandbox.helpers.imageUrl(f.id, options.format)
        };
      });
    },

    facebook: function(res, options) {
      "use strict";
      var format='source';
      switch (options.format){
        case 'small' :
        case 'thumb' :
        case 'square' :
          format = 'picture';
          break;
        case 'medium' :
        case 'large' :
        case 'original' :
          format = 'source';
          break;
      }

      return this.sandbox.util._.map(res.data, function(f) {
        return {
          provider: 'facebook',
          name: f.from.name,
          picture: f[format],
          uid: f.id
        };
      });
    },

    instagram: function(res, options){
      var format = 'low_resolution';
      switch (options.format){
        case 'small' :
        case 'thumb' :
        case 'square' :
          format = 'thumbnail';
          break;
        case 'medium' :
          format = 'standard_resolution';
          break;
        case 'large' :
        case 'original' :
          format = 'standard_resolution';
          break;
      }


      return this.sandbox.util._.map(res, function(f){
        var t = "";
        if(f && f.caption){t = f.caption.text;}
        return {
          provider: 'instagram',
          name: t,
          picture: f.images[format].url,
          uid: f.id
        };
      });
    }
  }
});
