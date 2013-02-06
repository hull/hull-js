/**
 * ## Widget ```comment```
 *
 * This widget is identified as ```comments@hull```. It is used to view and add comments to an object of the crrent application.
 *
 * ### Parameters:
 *
 * * ```id```: The object you want to manipulate comments upon.
 *
 * ### Templates:
 *
 * * ```comments/comments```: Display the collection of comments and allows to post a new comment if logged in.
 *
 *
 * ### Datasources:
 *
 * * ```comments```: The collection of all the comments related to the object.
 *
 * ### Actions:
 *
 * * ```comment```: Triggered when an user submits a new comment.
 */
define({
  type: 'Hull',
  templates:  ['comments'],

  initialize: function () {
    this.sandbox.on("collection.hull." + this.id + ".comments.**", function() {
      this.refresh();
    }.bind(this));
  },

  //@FIX Cache is broken for datasources declared as objects
  datasources: {
    comments: ":id/comments"
  },

  actions: {
    comment: function (elt, evt, data) {
      var description = this.$el.find("textarea").val();
      if (description && description.length > 0) {
        var comment = this.data.comments.create({
          description: description
        });
      }
    }
  }
});
