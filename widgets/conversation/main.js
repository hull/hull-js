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
 * ## Template:
 *
 * - `conversation`: Lists the messages for a conversation
 * - `form`: Displays a form to reply to a conversation
 *
 * ## Datasource:
 *
 * - `conversation`: The conversation
 *
 * ## Action:
 * - `postMsg`: Submits a new message.
 * - `deleteMsg`: Deletes a message
 * - `notification`: Enable/disable email notifications for user
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['conversation','form'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message: 'postMessage',
    deleteMsg: 'deleteMessage',
    notification: 'notification'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: function () {
      if (this.options.id) {
        return this.api(this.options.id );
      }
      else {
        return null;
      }
    },
    messages: function () {
      if (this.options.id) {
        // order will default to ASC, if not specified
        if('desc' == this.options.order) {
          orderBy = "created_at DESC"
        }
        else {
          orderBy = "created_at ASC"
        }
        return this.api(this.options.id + '/messages?order_by=' + orderBy)
      }
      else {
        return null;
      }
    }
  },

  initialize: function() {
    this.sandbox.on('hull.conversation.pick', function(id) {
      this.options.id = id;
      this.render();
    }, this)
  },
  
  beforeRender: function(data){
    "use strict";
    if(data.conversation) {
      data.messages = data.messages;
      data.participants = data.conversation.participants;
      _.each(data.messages, function(m) {
        m.isDeletable = (m.actor.id === this.data.me.id);
        
        var last_read = data.conversation.last_read;
        if(last_read instanceof Object){
          last_read = last_read[this.data.me.id];
        } 
        m.isNew = !m.isMe && (last_read ? m.id > last_read : true);
        
        return m;
      }, this);
      data.isFollowing = _.find(data.participants, function(p) {
        return p.id == this.data.me.id
      }, this)
      data.isAscending = this.options.order != 'desc';
      data.isNew = !(data.messages && data.messages.length > 0);
    }
    else {
      data.newConvo = true;
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
    setTimeout(_.bind(function() {
      var li = $('.hull-messages__list li:first-child');
      var cid = $('.hull-conversation__form').find('.media').data('hull-conversation-id');
      
      if(li && cid) {
        Hull.data.api(cid + '/messages', 'put', {});
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
  
  postMessage: function (e, data) {
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
      this.api(cid + '/messages', 'post', attributes).then(_.bind(function() {
        this.toggleLoading($formWrapper);
        this.render();
      }, this));
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
  
  notification: function(e, data) {
    "use strict";
    var $notification = this.$el.find('input');
    this.api(this.options.id + '/participants', 'put', {notification: $notification.prop('checked')});
  }
});
