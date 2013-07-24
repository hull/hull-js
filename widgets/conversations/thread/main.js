/**
 * ## Conversation
 * View a conversation's messages and allow users to reply to the thread.
 *
 * ## Example
 *
 *     <div data-hull-widget="conversations/thread@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Options:
 *
 * - `id`: Required, The id of the specific conversation object
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
 * - `deleteMsg`: destroys a message
 * - `notification`: Enable/disable email notifications for user
 */

Hull.define({
  type: 'Hull',

  templates: ['thread','form','participants'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message:      'message',
    deleteMsg:    'deleteMsg',
    notification: 'notification',
    delete:       'delete'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: function() {
      if(this.options.id) {
        return this.api(this.options.id);
      }
    },
    messages: function () {
      "use strict";
      if(this.options.id) {
        var orderBy;
        if('desc' === this.options.order) {
          orderBy = "created_at DESC";
        } else {
          orderBy = "created_at ASC";
        }
        return this.api(this.options.id + '/messages', {order_by: orderBy});
      }
      else {
        return null;
      }
    }
  },

  initialize: function() {
    "use strict";
    this.sandbox.on('hull.conversation.select', function(id) {
      this.options.id = id;
      this.render();
    }, this);
  },

  beforeRender: function(data, errors) {
    "use strict";
    if(data.conversation) {
      data.conversation.isDeletable = data.conversation.actor.id == data.me.id;
      data.messages = data.messages;
      data.participants = data.conversation.participants;
      this.sandbox.util._.each(data.messages, function(m) {
        m.isDeletable = (m.actor.id === this.data.me.id);

        var last_read = data.conversation.last_read;
        if(last_read instanceof Object){
          last_read = last_read[this.data.me.id];
        }
        m.isNew = !m.isMe && (last_read ? m.id > last_read : true);

        return m;
      }, this);
      data.isFollowing = this.sandbox.util._.find(data.participants, function(p) {
        return p.id == data.me.id;
      }, this)
      data.isAscending = this.options.order != 'desc';
      data.isNew = !(data.messages && data.messages.length > 0);
      this.sandbox.util._.each(data.messages, function(m){
        m.isMe = (m.actor.id===data.me.id);
      });
    }
    else {
      data.newConvo = true;
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

  message: function (e, data) {
    "use strict";
    e.preventDefault();
    var $form = this.$el.find("[data-hull-item='form']");
    var formData = this.sandbox.dom.getFormData($form);
    var description = formData.description;

    this.toggleLoading($form);
    if (description && description.length > 0) {
      var cid = data.data.id;
      var attributes = { body: description };
      this.api(cid + '/messages', 'post', attributes).then(this.sandbox.util._.bind(function() {
        this.toggleLoading($form);
        this.render();
      }, this));
    } else {
      this.toggleLoading($form);
    }
  },

  deleteMsg: function(e, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    var $parent = data.el
      .addClass('is-removing')
      .parents('[data-hull-message-id="'+ id +'"]');
    this.api.delete(id).then(function () {$parent.remove();});
  },

  delete: function(e, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    this.api.delete(id).then(function () {$('.hull-conversation').html('Conversation destroyd');});
  },

  notification: function(e, data) {
    "use strict";
    var $notification = this.$el.find('input');
    this.api(this.options.id + '/participants', 'put', {notification: $notification.prop('checked')});
  }
});
