/**
 * Displays comments on an object, that can be an internal Hull object (when you specify data-hull-id) or an external UID, (with data-hull-uid)
 * If using data-hull-uid, any unique string you can generate can be used to attach comments
 *
 * @name List
 * @param {String} id/uid Required The object you want to comment on.
 * @param {String} focus  Optional Auto-Focus on the input field. default: false.
 * @datasource {comments} Collection of all the comments made on the object.
 * @action {comment} Submits a new comment.
 * @example <div data-hull-component="comments/list@hull" data-hull-uid="http://hull.io"></div>
 * @example <div data-hull-component="comments/list@hull" data-hull-id="510fa2394875372516000009"></div>
 * @example <div data-hull-component="comments/list@hull" data-hull-id="app"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['list', 'form'],

  refreshEvents: ['model.hull.me.change'],

  requiredOptions: ['id'],

  actions: {
    comment: 'postComment',
    delete:  'deleteComment',
    flag:    'flagItem'
  },

  options: {
    focus: false,
    perPage: 10,
    page: 1
  },

  datasources: {
    comments: ':id/comments'
  },

  initialize: function() {
    var query = {};

    if (this.options.startPage) {
      query.page = this.options.startPage;
    } else {
      query.skip = this.options.skip || 0;
    }

    this.sandbox.on('hull.comments.' + this.options.id + ".**", function() {
      this.render()
    }, this);

    query.limit = this.options.limit || this.options.perPage;
    this.query = query;
  },

  beforeRender: function(data) {
    this.sandbox.util._.each(data.comments, function(c) {
      c.isDeletable = (c.user.id === data.me.id);
      return c;
    }, this);
    return data;
  },

  afterRender: function() {
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
  },

  deleteComment: function(event, action) {
    event.preventDefault();
    var id = action.data.id;
    var $parent = action.el
      .addClass('is-removing')
      .parents('[data-hull-comment-id="'+ id +'"]');
    this.api.delete(id).then(function () {$parent.remove();});
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
      this.api(this.options.id + '/comments', 'post', attributes).then(function(comment) {
        self.sandbox.emit('hull.comments.' + self.options.id + '.added', comment);
        self.toggleLoading();
        self.focusAfterRender = true;
        self.render();
      });
    }
  },

  flagItem: function (event, action) {
    event.preventDefault();
    var id = action.data.id;
    var isCertain = confirm('Do you want to report this content as inappropriate ?');
    if (isCertain) {
      this.sandbox.flag(id);
    }
  }
});
