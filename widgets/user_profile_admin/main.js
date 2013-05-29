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
  }

});
