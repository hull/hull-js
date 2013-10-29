/**
 *
 * Shows a review system with ratings from 1-5 and a text entry
 *
 * You can use this to swap the dropdown for a starring system easily with
 * jQuery plugins such as [raty](http://wbotelhos.com/raty)
 *
 * @name Reviews
 * @param {String} id/uid The object on which to do the review.
 * @param {Integer} max The max rating number. default: 5
 * @param {Boolean} focus Optional Auto-Focus on the input field. default: false.
 * @datasource {review} The current user's review on the object.
 * @datasource {reviews} Collection of all the reviews made on the object.
 * @action {review} Submits a new review.
 * @action {delete} Deletes the review.
 * @example <div data-hull-component="ratings/review@hull" data-hull-id="app" data-hull-range="5" data-hull-focus="true"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-id="ANY_HULL_ID"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-uid="YOUR_UNIQUE_ID"></div>
 * @example <div data-hull-component="ratings/review@hull" data-hull-uid="ANY_URL"></div>
 */
Hull.component({
  type: 'Hull',

  refreshEvents: ['model.hull.me.change'],

  templates: ['list', 'form'],

  requiredOptions: ['id'],

  datasources: {
    review: ':id/reviews/me',
    reviews: ':id/reviews'
  },

  events: {
    'change [name="rating"]' : 'checkButtonStatus'
  },

  options: {
    focus: false,
    perPage: 10,
    page: 1,
    max: 5
  },

  actions: {
    review: 'postReview',
    'delete':  'deleteReview'
  },

  initialize: function() {
    this.sandbox.on('hull.reviews.' + this.options.id + '.**', function() {
      this.render();
    }, this);
  },

  checkButtonStatus: function() {
    var disabled = !this.$find('select[name="rating"]').val();
    this.$find('[data-hull-action="review"]').attr('disabled', disabled);
  },

  toggleLoading: function () {
    this.$el.toggleClass('is-loading');
    this.$find('input,textarea,button').attr('disabled', this.$el.hasClass('is-loading'));
  },

  beforeRender: function(data) {
    data.range = this.sandbox.util._.range(this.options.max + 1);
    data.range.shift();
  },

  afterRender: function(data) {
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
    if (data.review && data.review.rating) {
      this.$find("select[name='rating']").val(data.review.rating);
    }
    this.checkButtonStatus();
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
    event.preventDefault();
    var self = this, id = action.data.id;
    var $parent = action.el
      .addClass('is-removing')
      .parents('[data-hull-review-id="'+ id +'"]');
    this.api(id, 'delete').then(function (review) {
      self.sandbox.emit('hull.reviews.' + self.options.id + '.removed', review);
      $parent.remove();
    });
  },

});

