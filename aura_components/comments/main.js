/**
 * ## Comments list
 *
 * Allow to list and add comments on an object of the current application.
 *
 * ### Example
 *
 *     <div data-hull-component="comments@hull" data-hull-id="HULL_OBJECT_ID"></div>
 *
 * or if you want to reference any other Entity (for example the url of the current page)
 *
 *     <div data-hull-component="comments@hull" data-hull-uid="http://path.to/my/url"></div>
 *
 * ### Option:
 *
 * - `id` or `uid`: Required, The object you want to comment on.
 * - `focus`: Optional, Auto-Focus on the input field. default: false.
 *
 * ### Template:
 *
 * - `comments`: Display a list of comments and a form that allows logged users
 *   to post new comments.
 *
 * ### Datasource:
 *
 * - `comments`: Collection of all the comments made on the object.
 *
 * ### Action:
 *
 * - `comment`: Submits a new comment.
 */

Hull.define({
  type: 'Hull',

  templates: ['comments'],

  refreshEvents: ['model.hull.me.change'],

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
      this.api(this.id + '/comments', 'post', attributes).then(function() {
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
