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

  templates: ['conversation','participants','form'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message: 'postMessage',
    follow: 'follow',
    deleteMsg: 'deleteMessage'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: function () {
      return this.api(this.options.id );
    },
    messages: function () {
      // order will default to ASC, if not specified
      if('desc' == this.options.order) {
        orderBy = "created_at DESC"
      }
      else {
        orderBy = "created_at ASC"
      }
      return this.api(this.options.id + '/messages?order_by=' + orderBy)
    }
  },

  beforeRender: function(data){
    "use strict";
    if(data && data.conversation) {
      data.messages = data.messages;
      data.participants = data.conversation.participants;
      _.each(data.messages, function(m) {
        m.isDeletable = (m.actor.id === this.data.me.id);
        m.isNew = !m.isDeletable && (!(data.conversation.last_read[this.data.me.id]) || (m.id > data.conversation.last_read[this.data.me.id]))
        return m;
      }, this);
      data.isFollowing = _.find(data.participants, function(p) {
        return p.id == this.data.me.id
      }, this)
      data.isAscending = this.options.order != 'desc';
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
      
      if(li) {
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
  
  follow: function (e, data) {
    "use strict";
    e.preventDefault();
    
    this.api(this.options.id + '/participants', 'put').then(_.bind(function() {
      this.focusAfterRender = true;
      this.render();
    }, this));
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
