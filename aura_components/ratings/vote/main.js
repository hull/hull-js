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

Hull.define({
  type: "Hull",

  refreshEvents: ['model.hull.me.change'],

  templates: ['vote'],

  datasources: {
    vote: ':id/reviews/me',
    target: ':id'
  },

  onTargetError: function () {
    "use strict";
    return {};
  },
  beforeRender: function(data){
    "use strict";
    if (this.sandbox.util._.isArray(data.vote)) {
      data.vote = data.vote[0];
    }
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
    evt.stopPropagation();
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

