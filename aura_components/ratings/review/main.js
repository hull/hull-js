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

  templates: ['list', 'form'],

  datasources: {
    review: ':id/reviews/me',
    reviews: ':id/reviews'
  },

  options: {
    focus: false,
    perPage: 10,
    page: 1
  },

  actions: {
    review: 'postReview',
    delete:  'deleteReview'
  },

  initialize: function() {
    this.sandbox.on('hull.reviews.' + this.options.id + '.**', function() {
      this.render();
    }, this);
  },

  toggleLoading: function () {
    this.$el.toggleClass('is-loading');
    this.$find('input,textarea,button').attr('disabled', this.$el.hasClass('is-loading'));
  },

  afterRender: function(data) {
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
    if (data.review && data.review.rating) {
      this.$find("select[name='rating']").val(data.review.rating);
    }
  },

  postReview: function (e) {
    e.preventDefault();
    var self = this, $form = this.$find('form'),
        formData = this.sandbox.dom.getFormData($form),
        rating = formData.rating;
    this.toggleLoading();

    if (rating) {
      this.api(this.options.id + '/reviews', 'post', formData).then(function(review) {
        self.sandbox.emit('hull.reviews.' + self.options.id + '.added', review);
        self.toggleLoading();
        self.focusAfterRender = true;
        self.render();
      });
    }
  },


  deleteReview: function(event, action) {

  }

});

