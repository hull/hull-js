/**
 *
 * Shows a star review system
 *
 * @name Stars
 * @param {String} id The object on which to do the review
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="entity:YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/stars@hull" data-hull-id="entity:http://hull.io"></div>
 */
Hull.component({
  type: 'Hull',

  templates: ['stars'],

  refreshEvents: ['model.hull.me.change'],

  requiredOptions: ['id'],

  datasources: {
    target: ':id'
  },

  options: {
    max: 5,
    actionable : 'true'
  },

  actions: {
    rate: function(e, options) {
      this.rate(options.data.rating);
      e.preventDefault();
    }
  },

  initialize: function() {
    this.sandbox.on('hull.reviews.' + this.options.id + '.**', function() {
      this.render();
    }, this);
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
    var self = this, rating = this.normalizeRating(rating);
    this.api.post(this.options.id + '/reviews', { rating: rating }).done(function(res) {
      self.sandbox.emit('hull.reviews.' + self.options.id + '.updated', res);
      self.sandbox.emit('hull.ratings.rate.complete', res);
      self.render();
    });
  },

  normalizeRating: function(rating) {
    var rating = parseInt(rating, 10);

    if (isNaN(rating) || rating < 0) {
      return 0;
    } else if (rating > this.options.max) {
      return this.options.max;
    } else {
      return rating;
    }
  }

});
