define({
  type:       'Hull',
  templates:  ['comments'],
  debug: true,

  datasources: {
    comments: function() {
      return this.api("hull/" + this.id + "/comments");
    }
  },

  actions: {
    comment: function() {
      var description = this.$el.find("textarea").val();
      if (description && description.length > 0) {
        this.api.post("hull", this.id + "/comments", {
          description: description
        }).then(this.refresh);
      }
    }
  }
});
