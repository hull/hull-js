/**
 * 
 * Shows a review system with ratings from 1-5 and a text entry
 *
 * You can use this to swap the dropdown for a starring system easily with
 * jQuery plugins such as [raty](http://wbotelhos.com/raty)
 *
 * @name Reviews
 * @param {String} id/uid The object on which to do the review
 * @example <div data-hull-component="ratings/review@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-uid="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-uid="ANY_URL"></div>
 */
Hull.component({
  type: 'Hull',

  refreshEvents: ['model.hull.me.change'],
  templates: ['review'],
  datasources: {
    review: function() { return this.api(this.options.id + "/reviews/me"); },
    reviews: function() { return this.api(this.options.id + "/reviews"); }
  },

  actions: {
    review: function(event, data) {
      var description = this.$el.find("[data-hull-description]").val(),
          rating      = this.$el.find('[data-hull-rating]').val(),
          self        = this;
      if (rating!==undefined) {
        this.api(this.id + '/reviews', 'post', {
          rating: rating,
          description: description
        }).then(function() {
          self.render();
        });
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }
});

