/**
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
 * ## Template:
 *
 * - `conversations`: 
 * - `participants`: 
 *
 * ## Datasource:
 *
 * - `conversation`: The conversation
 *
 * ## Action:
 *
 * - `message`: Submits a new message.
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['conversation','participants'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message: 'postMessage',
    follow: 'follow',
    deleteMsg: 'deleteMssage'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: function () {
      if(this.options.id) {
        return this.api(this.options.id);
      }
    },
    messages: function () {
      return this.api(this.options.id + '/messages')
    }
  },

  beforeRender: function(data){
    "use strict";
    if(data && data.conversation) {
      data.messages = data.messages;
      data.participants = data.conversation.participants;
      _.each(data.messages, function(m) {
        m.isDeletable = (m.sender.id === this.data.me.id);
        m.isNew = !m.isDeletable && (!(data.conversation.last_read[this.data.me.id]) || (m.id > data.conversation.last_read[this.data.me.id]))
        return m;
      }, this);
      data.isFollowing = _.find(data.participants, function(p) {
        return p.id == this.data.me.id
      }, this)
    }
    return data;
  },
  
  afterRender: function() {
    "use strict";
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
    setTimeout(_.bind(function() {
      var li = $('.hull-messages__list li:first-child');
      var cid = $('.hull-conversation__form').find('.media').data('hull-conversation-id');
      
      var meId = this.data.me.id;
      if(li) {
        Hull.data.api(cid + '/messages', 'put',  {message_id: li.data('hull-message-id')});
      }
    }, this), 5000);
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

      if(!cid) {
        var attributes = { 
          participant_ids: this.options.participantIds,
          message: description
        };
  
        // Create a new conversation & send initial message
        this.api(this.options.subjectId + '/conversations', 'post', attributes).then(_.bind(function() {
          this.toggleLoading($formWrapper);
          this.focusAfterRender = true;
          this.render();
        }, this))
      }
      else {
        // Reply to existing conversation
        var attributes = { body: description };
        this.api(cid + '/messages', 'post', attributes).then(_.bind(function() {
          this.toggleLoading($formWrapper);
          this.focusAfterRender = true;
          this.render();
        }, this));
      }
    }
  },
  
  follow: function (e, data) {
    "use strict";
    e.preventDefault();
    var $formWrapper = this.$el.find('.hull-conversation__form');
    var $form = $formWrapper.find('form');
    var $media = $formWrapper.find('.media');
    var cid = $media.data('hull-conversation-id');
    
    this.api(cid + '/participants', 'put').then(_.bind(function() {
    }, this));
  },
  
  deleteMessage: function(e, data) {
    "use strict";
    // TODO: implement
  }
});
