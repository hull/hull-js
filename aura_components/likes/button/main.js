/**
 *
 * Shows a Like/Unlike button, with number of likes and if the current user has liked the object or not
 *
 * Allow users to `like` an object. Likes are not connected to facebook or any other network
 * You can use this as "favorite", "starred", "want"... or of course "like".
 * It also shows the number of likes the object has.
 *
 * @name Button
 * @param {String} id/uid The object on which to fetch likes.
 * @datasource {target} Info on the object.
 * @datasource {liked} Has the current user liked the object.
 * @template {button} The main template. Has 3 states: Unliked, Liked.
 * @example <div data-hull-component="likes/button@hull" data-hull-uid="http://hull.io"></div>
 * @example <div data-hull-component="likes/button@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="likes/button@hull" data-hull-uid="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="likes/button@hull" data-hull-uid="ANY_URL"></div>
 */

Hull.component({
  templates: ["button"],
  refreshEvents: ['model.hull.me.change'],
  requiredOptions: ['id'],

  working: false,

  datasources: {
    target: ":id",
    liked: function() {
      return this.liked || this.api("me/liked/" + this.options.id);
    }
  },

  onTargetError: function () {
    return { stats: {} };
  },

  beforeRender:function(data) {
    this.target     = data.target;
    data.likesCount = data.target.stats.likes || 0;
    return data;
  },

  act: function(action) {
    var self = this,
        method = action == 'like' ? 'post' : 'delete';
    this.api(this.options.id + '/likes', method).then(function() {
      self.liked = action == 'like' ? true : false;
      self.render();
    });
  },

  actions: {
    like: function(e, action) {
      e.preventDefault();
      this.act('like');
    },
    unlike: function(e, action) {
      e.preventDefault();
      this.act('unlike');
    }
  }

});
