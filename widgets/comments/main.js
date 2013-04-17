/**
 *
 * Allow to list and add comments on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="comments@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The object you want to manipulate comments upon.
 * - `focus`: Optional, Auto-Focus on the input field. default: false.
 *
 * ## Template:
 *
 * - `comments`: Display a list of comments and a form that allows logged users
 *   to post new comments.
 *
 * ## Datasource:
 *
 * - `comments`: Collection of all the comments made on the object.
 *
 * ## Action:
 *
 * - `comment`: Submits a new comment.
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['comments'],

  refreshEvents: ['model.hull.me.change'],

  events: {
    'form submit' : 'submitForm'
  },

  actions: {
    comment: 'submitForm',
    delete: 'deleteComment'
  },

  options: {
    focus: false
  },

  initialize: function() {
    "use strict";
    var id = this.getId();
    if (id) {
      this.path = 'hull/' + id + '/comments';
    } else {
      throw new Error('You must provide an ID to the Comment Widget');
    }
  },

  datasources: {
    comments: function() {
      "use strict";
      if (this.path) {
        return this.api(this.path);
      }
    }
  },

  beforeRender: function(data){
    "use strict";
    var self = this;
    _.each(data.comments,function(r){
      r.isDeletable = (r.user.id === self.data.me.id);
      return r;
    });
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
    this.api.delele(data.data.id).then(function(){
      data.el.slideUp().parents('li.media').remove();
    });
    event.preventDefault();
  },
  submitForm: function (e) {
    "use strict";
    e.preventDefault();
    var form = this.$el.find('form');
    var formData = this.sandbox.dom.getFormData(form);
    var description = formData.description;
    if (description && description.length > 0) {
      var attributes = { description: description };
      if (this.uid) attributes.uid = this.uid;
      this.api(this.path, 'post', attributes).then(function() {
        this.focusAfterRender = true;
        this.render();
      }.bind(this));
    }
  }
});
