/**
 * ## Conversation
 *
 * Allow to start and reply to a conversation on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="conversation@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The id of the specific conversation object
 *
 * OR
 *
 * - `subjectid`: Required, The object you want to start a conversation upon.
 * - `participantid`: Required, comma-separated ids of the participants
 *
 * ## Templates:
 *
 * - `conversation`: The main template, that show conversation's messages,
 *   participants and form
 * - `participants`: List of the conversation's participants
 * - `form`: A form that allow logged user to add messages to the conversation
 * - `conversation_button`: "Start a Conversation" button
 *
 * ## Datasource:
 *
 * - `conversation`: The conversation
 *
 * ## Actions:
 *
 * - `create`: Creates a conversation
 * - `message`: Submits a new message.
 * - `deleteMsg`: Deletes a message
 */

Hull.define({
  type: 'Hull',

  templates: ['conversation','participants','form','conversation_button'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    create: 'createConvo',
    message: 'postMessage',
    deleteMsg: 'deleteMessage'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: ':id',
    messages: function () {
      "use strict";
      var orderBy;
      if('desc' === this.options.order) {
        orderBy = "created_at DESC";
      } else {
        orderBy = "created_at ASC";
      }
      return this.api(this.options.id + '/messages', {orderBy: orderBy});
    }
  },

  initialize: function() {
    "use strict";
    this.sandbox.on('hull.conversation.pick', function(id) {
      this.options.id = id;
      this.render();
    }, this);
  },

  beforeRender: function(data, errors) {
    "use strict";
    if(data.conversation) {
      data.messages = data.messages;
      data.participants = data.conversation.participants;
      this.sandbox.util._.each(data.messages, function(m) {
        m.isDeletable = (m.actor.id === this.data.me.id);
        m.isNew = !m.isDeletable && (!(data.conversation.last_read) || (m.id > data.conversation.last_read));
        return m;
      }, this);
      data.isFollowing = this.sandbox.util._.find(data.participants, function(p) {
        return p.id === this.data.me.id;
      }, this);
      data.isAscending = this.options.order !== 'desc';
    } else {
      data.errors = errors;
    }
    return data;
  },

  afterRender: function() {
    "use strict";
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
    // Mark msgs as read
    setTimeout(this.sandbox.util._.bind(function() {
      var li = $('.hull-messages__list li:first-child');
      var cid = $('.hull-conversation__form').find('.media').data('hull-conversation-id');

      if(li && cid) {
        this.api(cid + '/messages', 'put', {});
      }
    }, this), 2000);
  },
  toggleLoading: function ($el) {
    "use strict";
    var $form = $el.toggleClass('is-loading');
    var $btn = $form.find('.btn');
    $btn.attr('disabled', !$btn.attr('disabled'));
    var $textarea = $form.find('textarea');
    $textarea.attr('disabled', !$textarea.attr('disabled'));
  },

  postMessage: function (e/*, data*/) {
    "use strict";
    e.preventDefault();
    var $formWrapper = this.$el.find('.hull-conversation__form');
    var $form = $formWrapper.find('form');
    var $media = $formWrapper.find('.media');
    var formData = this.sandbox.dom.getFormData($form);
    var description = formData.description;

    this.toggleLoading($formWrapper);
    if (description && description.length > 0) {
      var cid = $media.data('hull-conversation-id');
      var attributes = { body: description };
      this.api(cid + '/messages', 'post', attributes).then(this.sandbox.util._.bind(function() {
        this.toggleLoading($formWrapper);
        this.render();
      }, this));
    } else {
      this.toggleLoading($formWrapper);
    }
  },

  deleteMessage: function(e, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    var $parent = data.el
      .addClass('is-removing')
      .parents('[data-hull-message-id="'+ id +'"]');
    this.api.delete(id).then(function () {$parent.remove();});
  }
});
