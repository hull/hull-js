Hull.widget('comments', {
  templates:  ['comments'],
  debug: true,

  initialize: function() {
    this.sandbox.on("collection.hull." + this.id + ".comments.**", function() { this.refresh(); }.bind(this));
  },

  //@FIX Cache is broken for datasources declared as objects
  datasources: {
    comments: ":id/comments"
  },
  
  actions: {
    comment: function (elt, evt, data) {
      var description = this.$el.find("textarea").val();
      if (description && description.length > 0) {
        var comment = this.datasources.comments.create({
          description: description
        });
        var xhr = comment.save();
        xhr.promise().then(_.bind(this.render, this, null, null));
      }
      evt.stopPropagation();
    }
  }
});
