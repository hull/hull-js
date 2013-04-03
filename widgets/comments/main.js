/**
 *
 * Allow to list and add comments on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="comments@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The object you want to manipulate comments upon.
 *
 * ## Template:
 *
 * - `comments`: Display a list of comments and a form that allows logged users
 *   to post new comments.
 *
 * ## Datasource:
 *
 * - `comments`: Collection of all the comments made on the object.
 *
 * ## Action:
 *
 * - `comment`: Submits a new comment.
 */
define({
  type: 'Hull',

  templates: ['comments'],

  refreshEvents: ['model.hull.me.change'],

  initialize: function () {
    this.setup();
  },

  setup: function() {
    if (this.options.id) {
      if (/^[0-9a-f]{24}|me|app|org|project$/.test(this.options.id)) {
        this.id = this.options.id;
      }
    } else if (this.options.uid) {
      this.id = this.sandbox.util.base64.encode(this.options.uid, true);
    } else if (this.sandbox.config.entity) {
      this.id = this.sandbox.config.entity.id
    }
    this.path = 'hull/' + this.id + '/comments';
  },

  datasources: {
    comments: function() {
      if (this.id) {
        return this.api(this.path);
      } else {
        return false;
      }
    }
  },

  beforeRender: function(data) {
    data.uid = this.uid;
    return data;
  },

  actions: {
    comment: function (elt, evt, data) {
      var description = this.$el.find('textarea').val();
      if (description && description.length > 0) {
        var attributes = { description: description };
        if (this.uid) attributes.uid = this.uid;
        this.api(this.path, 'post', attributes).then(function() {
          this.render()
        }.bind(this));
      }
    }
  }
});
