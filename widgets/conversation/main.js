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

  templates: ['conversation'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message: 'postMessage',
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: function () {
      if(this.options.id) {
        return this.api(this.options.id);
      }
      else if(this.options.subjectId && this.options.participantIds){
        var attrs = {participant_ids: this.options.participantIds}
        return this.api(this.options.subjectId + '/conversations', attrs);
      }
    }
  },

  beforeRender: function(data){
    "use strict";
    if(data && data.conversation) {
      data.messages = data.conversation.messages;
      data.participants = _.filter(data.conversation.participants, function(p) {
        return p.id != this.data.me.id
      }, this);
      _.each(data.messages, function(m) {
        // m.isDeletable = (m.sender.id === this.data.me.id);
        return m;
      }, this);
    }
    return data;
  },
  afterRender: function() {
    "use strict";
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
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
        var attributes = { message: description };
        this.api(cid + '/messages', 'post', attributes).then(_.bind(function() {
          this.toggleLoading($formWrapper);
          this.focusAfterRender = true;
          this.render();
        }, this));
      }
    }
  }
});
