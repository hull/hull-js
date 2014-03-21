/**
 *
 * Shows a up/down-vote system.
 * It also shows the number of votes the object has.
 *
 * @name Vote
 * @param {String} id Target object to show vote buttons for
 * @template {vote} Main template. Has 3 states: Upvote, Downvote, Blank
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="entity:YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/vote@hull" data-hull-id="entity:http://hull.io"></div>
 */

Hull.component({
  type: 'Hull',

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote'],

  datasources: {
    myReview: function() {
      if (this.loggedIn() && this.options.id) {
        return this.api(this.options.id + "/reviews/me");
      } else {
        return false;
      }
    },
    target: ':id'
  },


  initialize: function() {
    this.sandbox.on('hull.reviews.' + this.options.id + '.**', function() {
      this.render();
    }, this);
  },

  beforeRender: function(data) {
    var votes = { up: 0, down: 0 };
    if (data.target && data.target.stats && data.target.stats.reviews) {
      var reviews = data.target.stats.reviews;
      if (reviews.distribution) {
        votes = {
          down: reviews.distribution['-1'] || 0,
          up: reviews.distribution['1'] || 0
        };
      }
    }
    if (data.myReview) {
      data.myVote = data.myReview.rating;
    }
    data.votes = votes;
    return data;
  },

  update_vote: function(evt, rating){
    evt.stopPropagation();
    var description = this.$el.find("textarea").val();
    var self = this;
    if(rating!=undefined){
      var d = {
        rating: rating,
        description: description
      };
      this.api(this.options.id + '/reviews', 'post', d).then(function(res) {
        self.sandbox.emit('hull.reviews.' + self.options.id + '.updated', res);
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

