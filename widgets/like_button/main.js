define({
  type: "Hull",

  templates: ["like_button"],

  working: false,

  datasources: {
    isLiked: function() {
      if (typeof this.isLiked === 'boolean') {
        return this.isLiked;
      } else {
        return this.api('hull/' + this.id + '/likes/me');
      }
    }
  },

  beforeRender: function(data) {
    if (!data.me || !data.me.id) {
      this.isLiked = undefined;
    } else {
      this.isLiked = this.isLiked || data.isLiked;
    }
    data.likesCount = data.likesCount || this.options.likes_count;
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
