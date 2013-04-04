/**
 * # Images
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
 * - `provider`: Optional, service from which we will fetch images. Can be `hull`, `current`, `instagram`, or `facebook`, by default it will list images from `hull`.  
 *   `hull` will show the user's images who also have interacted with the app.  
 *   `current` will show all images from the provider which the user has used to login.
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

    if (this.options.provider === 'current') {
      this.provider = this.me.get('identities')[0].provider;
    } else {
      this.provider = this.options.provider;
    }

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

      var deferred = this.sandbox.data.deferred();
      var self = this;
      var authorization = {
        provider_name: this.provider,
        provider:false,
        permissions:false
      };

      if(this.provider==="hull"){
        authorization.provider=true
        authorization.permissions=true
        deferred.resolve(authorization)

      } else if (this.loggedIn()[this.provider]){

        if(this.provider==="facebook"){
          authorization.provider=true;
          this.check_facebook_permissions(self.options.scope, authorization)
        } else{
          authorization.provider=true
          authorization.permissions=true
          deferred.resolve(authorization)
        }
      } else {
        authorization.provider=false
        authorization.permissions=false
        deferred.resolve(authorization)
      }
      return deferred.promise();

    },

    images: function() {

      var deferred = this.sandbox.data.deferred();
      var self = this;

      // map identities by name
      var identities = _.reduce(this.me.get('identities'), function(m, i) {
        m[i.provider] = i;
        return m;
      }, {});

      if(this.provider==="hull" || this.loggedIn()[this.provider]){
        this.request(this.provider, identities, this.options).then(_.bind(function(res) {

          var serialized = _.bind(this.serializers[self.provider],this,res,this.options)
          var images = serialized().slice(0, this.options.limit)
          deferred.resolve(images);

        }, this));
      } else{
        return deferred.resolve([]);
      } 

      return deferred.promise();
    }

  },

  check_facebook_permissions: function(scope, authorization){
    return this.api("facebook/me/permissions").then(function(res) {
      if(_.isArray(scope)){
        //Scope is an array, and we have all the perms we need.
        if (_.intersection(_.keys(res.data[0]), scope).length==scope.length){
          authorization.permissions=true;
        }

      } else {
        //Scope is a String, and it's in our permissions list
        if (_.include(_.keys(res.data[0]),scope)){
          authorization.permissions=false;
        }

      }
      return deferred.resolve(authorization);
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
          picture: sandbox.imageUrl(f.id, options.format)
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
