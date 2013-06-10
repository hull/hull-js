/**
 * ## Vote Buttons
 *
 * Allow users to vote for or against an object.
 * It also shows the number of votes the object has.
 *
 * ### Examples
 *
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="HULL_ID"></div>
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="ANY_URL"></div>
 *
 * ### Options
 *
 * - `id`: Target object to show vote buttons for
 *
 * ### Template
 *
 * - `vote_buttons`: Main template. Has 3 states: Upvote, Downvote, Blank
 *
 */
define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote'],

  datasources: {
    vote: function(){
      if(this.loggedIn()){
        return this.api(this.id+'/reviews/me');
      } else {
        return false;
      }
    },
    target: function(){
      return this.api(this.id);
    }
  },

  beforeRender: function(data){
    data.split = {
      blank:0,
      yes:0,
      no:0
    };
    if(!data.target.stats || !data.target.stats.reviews){
      return data;
    }
    data.split.blank = data.target.stats.reviews.distribution['0']||0;
    data.split.yes = data.target.stats.reviews.distribution['1']||0;
    data.split.no = data.target.stats.reviews.distribution['-1']||0;
    return data;
  },

  update_vote: function(evt, rating){
    var description = this.$el.find("textarea").val();
    var self= this;
    if(rating!=undefined){
      var d = {
        rating: rating,
        description: description
      };
      this.api(this.id + '/reviews', 'post', d).then(function() {
        self.render();
      });
    }
    evt.stopPropagation();
  },

  actions: {
    downvote:function(evt,data){
      this.update_vote(evt, -1);
    },
    unvote: function(evt,data){
      this.update_vote(evt, 0);
    },
    upvote: function(evt, data) {
      this.update_vote(evt, 1);
    }
  }
});

