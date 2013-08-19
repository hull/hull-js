/**
 * ## Conversation
 * View a conversation's messages and allow users to reply to the thread.
 *
 * ## Example
 *
 *     <div data-hull-component="conversations/thread@hull" data-hull-id="OBJECT_ID"></div>
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
    enableNotifications: 'enableNotifications',
    disableNotifications: 'disableNotifications',
    delete:       'delete'
  },

  options: {
    focus: true,
    order: 'desc'
  },

  datasources: {
    conversation: function() {
      if(this.options.id) {
        return this.api(this.options.id);
      }
    },
    messages: function () {
      if(this.options.id) {
        return this.api(this.options.id + '/messages', this.getMessagesParams());
      }
      else {
        return null;
      }
    }
  },

  getMessagesParams: function() {
    var params = {  };
    if (this.options.limit) {
      params.per_page = this.options.limit;
    }
    return params;
  },

  initialize: function() {
    this.sandbox.on('hull.conversation.select', function(id) {
      this.options.id = id;
      this.render();
    }, this);
  },

  beforeRender: function(data, errors) {
    var _ = this.sandbox.util._;
    data.isAscending = this.options.order != 'desc';
    if (data.conversation) {
      window._messages = data.messages;
      data.participants = data.conversation.participants;
      if (this.loggedIn()) {
        data.conversation.isDeletable = (data.conversation.actor && data.conversation.actor.id == data.me.id);
        _.each(data.messages, function(m) {
          m.isDeletable = m.actor && (m.actor.id === this.data.me.id);

          var last_read = data.conversation.last_read;
          if(last_read instanceof Object){
            last_read = last_read[this.data.me.id];
          }
          m.isNew = !m.isMe && (last_read ? m.id > last_read : true);
          m.isMe = m.actor && (m.actor.id === data.me.id);
          return m;
        }, this);

        data.isFollowing = _.find(data.participants, function(p) {
          return p.id == data.me.id;
        }, this)

        data.isNew = !(data.messages && data.messages.length > 0);
      }
    }
    else {
      data.newConvo = true;
      data.errors = errors;
    }
    if('desc' !== this.options.order) {
      data.messages = data.messages.reverse();
    }
    return data;
  },

  afterRender: function(data) {
    var self = this;
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }

    var tips = this.$el.find('[data-toggle="tooltip"]');
    if (tips && tips.tooltip) {
      tips.tooltip();
    }

    // Mark msgs as read
    setTimeout(function() {
      if (self.options.id && data.messages) {
        self.api(self.options.id + '/messages', 'put');
      }
    }, 2000);
  },

  toggleLoading: function ($el) {
    var $form = $el.toggleClass('is-loading');
    var $btn = $form.find('.btn');
    $btn.attr('disabled', !$btn.attr('disabled'));
    var $textarea = $form.find('textarea');
    $textarea.attr('disabled', !$textarea.attr('disabled'));
  },

  message: function (e, data) {
    e.preventDefault();
    var self = this;
    var $form = this.$el.find("[data-hull-item='form']");
    var formData = this.sandbox.dom.getFormData($form);
    var body = formData.body;
    this.toggleLoading($form);
    if (body && body.length > 0) {
      var cid = data.data.id;
      var attributes = { body: body };
      this.api(cid + '/messages', 'post', attributes).then(function() {
        self.toggleLoading($form);
        self.render();
      });
    } else {
      this.toggleLoading($form);
    }
  },

  deleteMsg: function(e, data) {
    e.preventDefault();
    var id = data.data.id;
    var $parent = data.el
      .addClass('is-removing')
      .parents('[data-hull-message-id="'+ id +'"]');
    this.api.delete(id).then(function () { $parent.remove(); });
  },

  delete: function(e, data) {
    event.preventDefault();
    var id = data.data.id;
    var self = this;
    this.api.delete(id).then(function () {
      self.sandbox.emit('hull.conversation.thread.delete', {id:id, cid:self.cid});
    });
  },

  disableNotifications: function(e, data) {
    var self = this;
    this.api(this.options.id + '/notifications', 'delete').then(function() {
      self.render();
    });
  },

  enableNotifications: function(e, data) {
    var self = this;
    this.api(this.options.id + '/notifications', 'put').then(function() {
      self.render();
    });
  }
});
