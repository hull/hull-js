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
    focus: false
  },

  datasources: {
    comments: ':id/comments'
  },

  beforeRender: function(data){
    "use strict";
    this.sandbox.util._.each(data.comments, function(c) {
      c.isDeletable = (c.user.id === this.data.me.id);
      return c;
    }, this);
    return data;
  },
  afterRender: function() {
    "use strict";
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
  },

  deleteComment: function(event, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    var $parent = data.el
      .addClass('is-removing')
      .parents('[data-hull-comment-id="'+ id +'"]');
    this.api.delete(id).then(function () {$parent.remove();});
  },

  toggleLoading: function ($el) {
    "use strict";
    var $form = $el.toggleClass('is-loading');
    var $btn = $form.find('.btn');
    $btn.attr('disabled', !$btn.attr('disabled'));
    var $textarea = $form.find('textarea');
    $textarea.attr('disabled', !$textarea.attr('disabled'));
  },

  postComment: function (e) {
    "use strict";
    e.preventDefault();
    var $formWrapper = this.$el.find('.hull-comments__form');
    var $form = $formWrapper.find('form');
    var formData = this.sandbox.dom.getFormData($form);
    var description = formData.description;

    this.toggleLoading($formWrapper);

    if (description && description.length > 0) {
      var attributes = { description: description };
      this.api(this.id + '/comments', 'post', attributes).then(this.sandbox.util._.bind(function() {
        this.toggleLoading($formWrapper);
        this.focusAfterRender = true;
        this.render();
      }, this));
    }
  },

  flagItem: function (event, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    var isCertain = confirm('Do you want to report this content as inappropriate ?');
    if (isCertain) {
      this.sandbox.flag(id);
    }
  }
});
