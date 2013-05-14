/**
 * # Like Button
 *
 * Allow users to `like` an object. Likes are not connected to facebook or any other network
 * You can use this as "favorite", "starred", "want"... or of course "like".
 *
 * ## Examples
 *
 *     <div data-hull-widget="like_button@hull" data-hull-id="HULL_ID"></div>
 *     <div data-hull-widget="like_button@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 *     <div data-hull-widget="like_button@hull" data-hull-id="ANY_URL"></div>
 *
 * ## Options
 *
 * - `provider`: Optional, One or more providers to log users in.
 *   If none specified, will show all configured providers for the app.
 *
 * ## Template
 *
 * - `login_button`: Show login buttons if the user isn't logged, logout button if he is.
 *
 */

 define({
  type: "Hull",

  templates: ["like_button"],

  working: false,

  initialize: function() {
    if (this.options.liked) {
      this.isLiked = (this.options.liked == true);
    }
  },

  datasources: {
    liked: "me/liked",
  },

  beforeRender: function(data) {
    var likedIds = _.map(data.liked,function(l){return l.liked.id});

    // var likedIds = _.pluck(data.liked, 'id');
    if (!data.me || !data.me.id) {
      this.isLiked = undefined;
    } else if (typeof this.isLiked !== 'boolean') {
      var target=this.id;
      switch (target){
        case 'app' :
          this.id = data.app.id;
          break;
        case 'me' :
          this.id = data.me.id;
          break;
        case 'org' :
          this.id = data.org.id;
          break;
      }
      this.isLiked = _.include(likedIds, this.id);
    }
    data.likesCount = this.likesCount || this.options.likesCount;
    data.isLiked = this.isLiked;
    return data;
  },

  act: function(verb) {
    if (this.working) {
      return;
    }
    this.working = true;
    var method = verb === 'unlike' ? 'delete' : 'post';
    this.isLiked    = !this.isLiked;
    this.api(this.id + '/likes', method, function(count) {
      this.working    = false;
      this.likesCount = count
      this.render('like_button', { isLiked: this.isLiked, likesCount: this.likesCount });
    }.bind(this)).fail(function(){
      this.isLiked = !this.isLiked;
    });
  },

  actions: {
    like: function() {
      this.act('like');
    },
    unlike: function() {
      this.act('unlike');
    }
  }

});
