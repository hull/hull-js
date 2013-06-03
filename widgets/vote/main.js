/**
 * # Vote Buttons
 *
 * Allow users to vote for or against an object.
 * It also shows the number of votes the object has.
 *
 * ## Examples
 *
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="HULL_ID"></div>
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 *     <div data-hull-widget="vote_buttons@hull" data-hull-id="ANY_URL"></div>
 *
 * ## Options
 *
 * - `id`: Target object to show vote buttons for
 *
 * ## Template
 *
 * - `vote_buttons`: Main template. Has 3 states: Upvote, Downvote, Blank
 *
 */
define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote_buttons'],

  datasources: {
    vote:  function() { 
      if(this.loggedIn()){
        return this.api("me/reviews/" + this.options.id);
      }
    },
    votes: ':id/reviews'
  },

  beforeRender: function(data){
    data.split = {yes:0, no:0, blank:0 };

    _.map(data.votes,function(vote){
      if(vote.rating>0){
        data.split.yes++;
      } else if (vote.rating<0){
        data.split.no++
      } else {
        data.split.blank++;
      }
    });
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
        self.render(self.getTemplate(), {vote:d});
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

