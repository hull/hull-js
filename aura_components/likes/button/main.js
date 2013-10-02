/**
 * 
 * Shows a Like/Unlike button, with number of likes and if the current user has liked the object or not
 *
 * Allow users to `like` an object. Likes are not connected to facebook or any other network
 * You can use this as "favorite", "starred", "want"... or of course "like".
 * It also shows the number of likes the object has.
 * 
 * @name Button
 * @param {String} id/uid The object on which to fetch likes
 * @datasource {target} Info on the object
 * @datasource {liked} Has the current user liked the object 
 * @template {button} The main template. Has 3 states: Unliked, Liked and Working
 * @example <div data-hull-component="like_button@hull" data-hull-id="HULL_ID"></div>
 * @example <div data-hull-component="like_button@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="like_button@hull" data-hull-id="ANY_URL"></div>
 */

Hull.component({
  type: "Hull",

  templates: ["button"],
  refreshEvents: ['model.hull.me.change'],

  working: false,

  datasources: {
    // target: ':id',
    target: ":id",
    liked: function(){
      return this.api("me/liked/"+this.options.id);
    }
  },

  onTargetError: function () {
    "use strict";
    return { stats: {} };
  },

  beforeRender:function(data){
    data.likes = this.likes || data.target.stats.likes || 0
    if(this.liked!==undefined){
      data.liked = this.liked
    }

    this.likes = data.likes
    this.liked = data.liked

    return data;
  },

  act: function(verb) {
    if (this.working) {
      return;
    }
    this.working = false;
    var self=this;
    var method = verb === 'unlike' ? 'delete' : 'post';

    self.liked=!self.liked;
    (self.liked)? self.likes++ : self.likes--;


    self.render(self.getTemplate(),{working:self.working, likes:self.likes, liked:self.liked});

    //Events should be emitted automatically here so the likes@hull component
    //can subscribe and refresh itself.
    this.api(this.id + '/likes', method)
    .done(function(likes) {
      self.sandbox.emit('hull.like.' + self.id);
    }).fail(function(){
      (self.liked)? self.likes-- : self.likes++;
      self.liked=!self.liked;
      self.render(self.getTemplate(),{working:self.working, liked:self.liked, likes:self.likes});
    }).always(function(){
      self.working=false;

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
