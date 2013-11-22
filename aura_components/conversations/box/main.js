/**
 * Show a new message box for a conversation
 *
 * @name Box
 * @param {String} id Required The conversation object - This must a conversation ID. Use the '/ID/conversations' api call to get conversations for an entity or hull object.
 * @param {Boolean} focus Optional Focus after render
 * @template {box} A form that allow logged user to add messages to the conversation
 * @example <div data-hull-component="conversations/box@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="conversations/box@hull" data-hull-id="OBJECT_ID"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['box'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    message:      'message',
    enableNotifications: 'enableNotifications',
    disableNotifications: 'disableNotifications'
  },

  options: {
    focus: true
  },

  getMessagesParams: function() {
    var params = {  };
    if (this.options.limit) {
      params.per_page = this.options.limit;
    }
    return params;
  },

  afterRender: function(data) {
    var self = this;
    if(this.options.focus || this.focusAfterRender) {
      this.$el.find('input,textarea').focus();
      this.focusAfterRender = false;
    }
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
    this.api(id, 'delete').then(function () { $parent.remove(); });
  },

  'delete': function(e, data) {
    event.preventDefault();
    var id = data.data.id;
    var self = this;
    this.api(id, 'delete').then(function () {
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
