/**
 * 
 * Shows a star review system
 *
 * @name Stars
 * @param {String} id/uid The object on which to do the review
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-uid="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-uid="ANY_URL"></div>
 */
Hull.component({
  type: 'Hull',

  templates: ['stars'],

  refreshEvents: ['model.hull.me.change'],

  options: {
    max: 5,
    actionable : 'true'
  },

  initialize: function(){
    this._ = this.sandbox.util._;
  },

  datasources: {
    target: function() {
      return this.api(this.options.id);
    }
  },

  beforeRender: function(data) {
    data.average = data.target.stats.reviews ? data.target.stats.reviews.avg : 0;
    data.average = this.normalizeRating(data.average);
    var ratings = [];
    for (var i = 0; i < this.options.max; i) {
      ratings[i] = {
        value : ++i,
        active: (i<=data.average)
      };
    }
    data.ratings = ratings;
  },

  rate: function(rating) {
    rating = this.normalizeRating(rating);
    this.api.post(this.options.id + '/reviews', { rating: rating }).done(this._.bind(function(res) {
      this.sandbox.emit('hull.ratings.rate.complete', res);
      this.render();
    }, this));
  },

  normalizeRating: function(rating) {
    rating = parseInt(rating, 10);

    if (isNaN(rating) || rating < 0) {
      return 0;
    } else if (rating > this.options.max) {
      return this.options.max;
    } else {
      return rating;
    }
  },

  actions: {
    rate: function(e, options) {
      this.rate(options.data.rating);
      e.preventDefault();
    }
  }
});
