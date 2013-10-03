/**
 *
 * Shows a up/down-vote system.
 * It also shows the number of votes the object has.
 *
 * @name Vote
 * @param {String} id/uid Target object to show vote buttons for
 * @template {vote} Main template. Has 3 states: Upvote, Downvote, Blank
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-uid="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-uid="ANY_URL"></div>
 */

Hull.component({
  type: 'Hull',

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote'],

  datasources: {
    myVote: function() {
      if (this.loggedIn()) {
        return this.myInitialVote || this.api(this.options.id + "/reviews/me");
      }
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

