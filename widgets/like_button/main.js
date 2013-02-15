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
    myLikes: "me/liked",
  },

  beforeRender: function(data) {
    var likedIds = _.pluck(data.myLikes, 'liked_id');
    if (!data.me || !data.me.id) {
      this.isLiked = undefined;
    } else if (typeof this.isLiked !== 'boolean') {
      this.isLiked = _.include(likedIds, this.id);
    }
    data.likesCount = data.likesCount || this.options.likesCount;
    data.isLiked = this.isLiked;
    return data;
  },

  act: function(verb) {
    if (this.working) {
      return;
    }
    this.working = true;
    var method = verb === 'unlike' ? 'delete' : 'post';
    this.api('hull/' + this.id + '/likes', method, function(count) {
      this.working    = false;
      this.isLiked    = !this.isLiked;
      this.likesCount = count
      this.render('like_button', { isLiked: this.isLiked, likesCount: this.likesCount });
    }.bind(this));
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
