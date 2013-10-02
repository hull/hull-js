/**
 * ## Vote Buttons
 *
 * Allow users to vote for or against an object.
 * It also shows the number of votes the object has.
 *
 * ### Examples
 *
 *     <div data-hull-component="vote_buttons@hull" data-hull-id="HULL_ID"></div>
 *     <div data-hull-component="vote_buttons@hull" data-hull-id="YOUR_UNIQUE_ID"></div>
 *     <div data-hull-component="vote_buttons@hull" data-hull-uid="ANY_URL"></div>
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
Hull.define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote'],

  datasources: {
    myVote: function() {
      return this.myInitialVote || this.api(this.options.id + "/reviews/me");
    }
  },


  beforeRender: function(data){
    "use strict";
    this.myInitialVote = data.myVote;
    if (!this.votes) {
      this.updateVotesFromStats(data.myVote);
    }
    data.myVote   = this.myVote;
    data.votes    = this.votes;
    return data;
  },

  updateVotesFromStats: function(stats) {
    this.myVote = stats.rating || 0;
    if (stats && stats.ratings && stats.ratings.distribution) {
      var distribution = stats.ratings.distribution
      this.votes = {
        down: distribution['-1'] || 0,
        up:   distribution['1'] || 0
      }
    } else {
      this.votes = { down: 0, up: 0 };
    }
  },

  update_vote: function(evt, rating){
    evt.stopPropagation();
    var description = this.$el.find("textarea").val();
    var self= this;
    if(rating!=undefined){
      var d = {
        rating: rating,
        description: description
      };
      this.api(this.options.id + '/reviews', 'post', d).then(function(res) {
        self.updateVotesFromStats(res);
        self.render();
      });
    }
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

