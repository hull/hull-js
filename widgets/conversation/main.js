/**
 * ## Conversation
 * View a conversation's messages and allow users to reply to the thread. 
 *
 * ## Example
 *
 *     <div data-hull-widget="conversation@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
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
 * - `deleteMsg`: Deletes a message
 * - `notification`: Enable/disable email notifications for user
 */

Hull.define({
  type: 'Hull',

  templates: ['conversation','form','participants'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message: 'postMessage',
    deleteMsg: 'deleteMessage',
    deleteConvo: 'deleteConvo',
    notification: 'notification'
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
    this.sandbox.on('hull.conversation.pick', function(id) {
      this.options.id = id;
      this.render();
    }, this);
  },

  beforeRender: function(data, errors) {
    "use strict";
    if(data.conversation) {
      data.conversation.isDeleteable = data.conversation.actor.id == this.data.me.id;
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
        return p.id == this.data.me.id
      }, this)
      data.isAscending = this.options.order != 'desc';
      data.isNew = !(data.messages && data.messages.length > 0);
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
  },
  
  deleteConvo: function(e, data) {
    "use strict";
    event.preventDefault();
    var id = data.data.id;
    this.api.delete(id).then(function () {$('.hull-conversation').html('Conversation deleted');});
  },
  
  notification: function(e, data) {
    "use strict";
    var $notification = this.$el.find('input');
    this.api(this.options.id + '/participants', 'put', {notification: $notification.prop('checked')});
  }
});
