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
  },

  toggleLoading: function () {
    this.$el.toggleClass('is-loading');
    this.$find('input,textarea,button').attr('disabled', this.$el.hasClass('is-loading'));
  },

  postComment: function (e) {
    e.preventDefault();
    var self = this, $form = this.$find('form'),
        formData = this.sandbox.dom.getFormData($form),
        description = formData.description;
    this.toggleLoading();

    if (description && description.length > 0) {
      var attributes = { description: description };
      this.api(this.id + '/comments', 'post', attributes).then(function() {
        self.toggleLoading();
        self.focusAfterRender = true;
        self.render();
      });
    }
  }

});
