/**
 *
 * Displays images belonging to a given user on a given service
 *
 * ## Example
 *
 *     <div data-hull-widget="images@hull"></div>
 *
 * ## Options
 *
 * - `id`: Optional, the id of the user whose images we want to list. By default, it will list the images of the current user.
 * - `format`: Optional, the format of the thumbnail you wish to get. Can be `thumb`, `square`, `small`, `medium`, `large`, `original`. Will map to the closest existing preset when used on external networks. Default:  `small`
 * - `provider`: Optional, service from which we will fetch images. Can be `hull`, `instagram`, or `facebook`, by default it will list images from `hull`.
 * - `limit`: Optional, the number of images to display. Be default it will display 10 images.
 * - `scope` : Optional, a Facebook permission you need to ask the user before being able to show data. - If this permission is not given, a button will be shown to ask for it.
 *
 * ## Template
 *
 * - `images`: Displays the list of the user's images.
 *
 * ## Actions
 *
 * - `authorize`: Pops up a permissions dialog or a login dialog.
 *
 * ## Datasource
 *
 * - `images`: The user's images.
 * - `authorized` : A hash of permissions showing if the user can view the images.  
 * Contains `provider`, `permissions` : Booleans showing if the provider and permissions are right,  
 * and `provider_name` containing the name of the asked provider
 * 
 */
define(['underscore'], {
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

    if (this.provider !== "hull") {
      this.id = this.options.id || "me";  
    }


  },

  actions: {
    authorize: function(){
      if(this.provider==="facebook"){
        this.sandbox.login('facebook', {scope:this.options.scope}).then(_.bind(function(){
          this.render();
        },this));
      } else {
        this.sandbox.login(this.provider,{}).then(_.bind(function(){
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
      var identities = _.reduce(this.me.get('identities'), function(m, i) {
        m[i.provider] = i;
        return m;
      }, {});

      //Are we logged in to provider, or is provider hull. if Provider is hull, are we asking "me" without being loggedin ?
      if( this.loggedIn()[this.provider] || (this.provider==="hull" && (this.loggedIn() || this.id!=="me"))){
        this.request(this.provider, identities, this.options).then(_.bind(function(res) {

          var serialized = _.bind(this.serializers[self.provider],this,res,this.options)
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

      auth.provider_name = this.sandbox.config.services.types.auth[0].replace(/_app$/,'');

      deferred.resolve(auth)
    } else {
      if (this.loggedIn()[provider]){
        auth.provider=true;
        if(provider==='facebook'){
          this.hasFacebookPermissions(self.options.scope, auth, deferred)
        } else {
          auth.permissions=true
          deferred.resolve(auth)
        }
      } else {
        auth.provider=false;
        deferred.resolve(auth)
      }
      
    }


    return deferred.promise();
  },
  hasFacebookPermissions: function(scope, authorization, deferred){
    var sandbox = this.sandbox
    this.api("facebook/me/permissions").then(function(res) {

      //Convert scope to array if given as a string.
      if(_.isString(scope)){
        scope = scope.replace(' ','').split(',')
      }

      if(_.isArray(scope) && (_.intersection(_.keys(res.data[0]), scope).length==scope.length)){
        //we have all the perms we need.
        authorization.permissions=true;
      }

      deferred.resolve(authorization);
    });
  },

  request: function(provider, identities, options) {
    var path, params;

    switch (provider) {
      case 'hull':
        path = 'hull/' + options.id + '/images';
        params = { per_page: this.options.limit };
        break;
      case 'facebook':
        path = 'facebook/'+options.id+'/photos/uploaded';
        // path = 'facebook/' + ((options.id==='me')?identities.facebook.uid:options.id) + '/photos';
        params = { };
        break;
      case 'instagram':
        path = 'instagram/users/'+((options.id==='me')?'self':options.id)+'/media/recent';
        params = { per_page: this.options.limit };
        break;
    }

    return this.api(path, params);
  },

  serializers: {
    hull: function(res, options) {
      var sandbox = this.sandbox
      return _.map(res, function(f) {
        return {
          provider: 'hull',
          name: f.name,
          picture: sandbox.helpers.imageUrl(f.id, options.format)
        };
      });
    },

    facebook: function(res, options) {
      var format='source'
      switch (options.format){
        case 'small' :
        case 'thumb' :
        case 'square' :
          format = 'picture'
          break;
        case 'medium' :
        case 'large' :
        case 'original' :
          format = 'source'
          break;
      }

      return _.map(res.data, function(f) {
        return {
          provider: 'facebook',
          name: f.from.name,
          picture: f[format],
          uid: f.id
        };
      });
    },

    instagram: function(res, options){
      var format = 'low_resolution'
      switch (options.format){
        case 'small' :
        case 'thumb' :
        case 'square' :
          format = 'thumbnail'
          break;
        case 'medium' :
          format = 'standard_resolution'
          break;
        case 'large' :
        case 'original' :
          format = 'standard_resolution'
          break;
      }


      return _.map(res, function(f){
        var t = ""
        if(f && f.caption){t = f.caption.text}
        return {
          provider: 'instagram',
          name: t,
          picture: f.images[format].url,
          uid: f.id
        }
      });
    }
  }
});
