define({
  type:       'Hull',
  templates:  ['comments'],
  debug: true,

  initialize: function() {
    this.sandbox.on("collection.hull." + this.id + ".comments.**", function() { this.refresh(); }.bind(this));
  },

  datasources: {
    comments: {
      provider: "hull",
      path: ":id/comments"
    }
  },
  
  actions: {
    comment: function() {
      var description = this.$el.find("textarea").val();
      if (description && description.length > 0) {
        this.datasources.comments.create({
          description: description
        });
      }        
    }
  }
});
