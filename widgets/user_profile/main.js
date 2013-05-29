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
    this.sandbox.on('hull-admin.user.select', function(userId) {
      this.id = userId;
      this.render();
    }, this);
  },

  beforeRender: function(data) {
    console.warn("Before Render with id: ", this.id, "and data: ", data.user);
    return data;
  }



});
