/**
 * Displays a comment box for an object, that can be an internal Hull object (when you specify data-hull-id) or an external UID, (with data-hull-uid)
 * If using data-hull-uid, any unique string you can generate can be used to attach comments
 *
 * @name Box
 * @param {String} id/uid Required The object you want to comment on.
 * @param {String} focus  Optional Auto-Focus on the input field. default: false.
 * @action {comment} Submits a new comment.
 * @example <div data-hull-component="comments/box@hull" data-hull-uid="http://hull.io"></div>
 * @example <div data-hull-component="comments/box@hull" data-hull-id="510fa2394875372516000009"></div>
 * @example <div data-hull-component="comments/box@hull" data-hull-id="app"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['box'],

  refreshEvents: ['model.hull.me.change'],

  events: {
    'keyup [name="description"]' : 'checkButtonStatus'
  },

  requiredOptions: ['id'],

  actions: {
    comment: 'postComment'
  },

  options: {
    focus: false
  },

  afterRender: function() {
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
    this.checkButtonStatus();
  },

  checkButtonStatus: function() {
    var disabled = !this.$find('[name="description"]').val();
    this.$find('[data-hull-action="comment"]').attr('disabled', disabled);
  },

  toggleLoading: function () {
    this.$el.toggleClass('is-loading');
    this.$find('input,textarea,button').attr('disabled', this.$el.hasClass('is-loading'));
  },

  postComment: function (e) {
    e.preventDefault();
    var self = this, $form = this.$find('form'),
        formData = this.sandbox.dom.getFormData($form);

    if (formData.description && formData.description.length > 0) {
      this.toggleLoading();
      this.api(this.options.id + '/comments', 'post', formData).then(function(comment) {
        self.sandbox.emit('hull.comments.' + self.options.id + '.added', comment);
        self.toggleLoading();
        $form[0].reset && $form[0].reset();
        self.focusAfterRender = true;
        self.$el.find('input,textarea').focus()
        self.checkButtonStatus();
      });
    }
  }

});
