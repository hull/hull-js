define({
  type:       'Hull',
  templates:  ['comments'],

  datasources: {
    comments: function() {
      return this.sandbox.data.api("hull/" + this.id + "/comments");
    }
  },

  actions: {
    comment: function() {
      var description = this.$el.find("textarea").val();
      if (description && description.length > 0) {
        this.sandbox.data.api.post("hull", this.id + "/comments", {
          description: description
        }).then(this.refresh);
      }
    }
  }
});

