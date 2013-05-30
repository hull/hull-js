define({

  type: "Hull",
  templates: ['user_profile'],

  datasources: {
    user: function() {
      if (this.id) {
        return this.api.model(this.id);
      }
    }
  },

  initialize: function() {
    this.id = this.options.id;
    this.sandbox.on('hull-admin.user.select', function(id) {
      this.id = id;
      this.render();
    }, this);
  },

  beforeRender: function(data){
    if(!data.user){
      return data;
    }
    _.each(data.user.identities,function(identity){
      identity.type=identity.type.replace(/_(app|account)$/,'');
    });
    return data;
  }

});
