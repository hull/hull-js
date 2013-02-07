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
    data.isLiked = this.isLiked;
    return data;
  },

  act: function(verb) {
    if (this.working) {
      return;
    }
    this.working = true;
    var method = verb === 'unlike' ? 'delete' : 'post';
    this.api('hull/' + this.id + '/likes', method, function(res) {
      this.working = false;
      if (res) {
        this.isLiked = !this.isLiked;
        this.render('like_button', { liked: this.isLiked });
      }
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
