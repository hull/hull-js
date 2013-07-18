/**
 * ## Conversations
 * List all conversations within this app
 *
 * ## Examples
 *
 *     <div data-hull-widget="conversations@hull"></div>
 *
 * ## Option:
 * - `visibility`: Optional, the visibility level
 *
 * ## Template:
 *
 * - `conversations`: Table of conversations
 *
 * ## Datasource:
 *
 * - `conversations`: List of all conversations
 *
 * ## Action:
 *
 * - `pickConvo`: Select a conversation.
 */

/*global define:true */
Hull.define({
  type: 'Hull',

  templates: ['conversations'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    pickConvo: "pickConversation",
  },

  options: {
    focus: false
  },

  datasources: {
    conversations: function () {
      "use strict";
      var url = this.options.id ? this.options.id : '';
      url += '/conversations';

      return this.api(url, {visibility: this.options.visibility || undefined});
    }
  },

  initialize: function() {
    this.sandbox.on('hull.conversation.reload', function(id) {
      this.options.id = id;
      this.render();
    }, this)
  },
  
  beforeRender: function(data, errors){
    "use strict";
    data.errors = errors;
    return data;
  },
  
  pickConversation: function(e, action) {
    this.sandbox.emit('hull.conversation.pick', action.data.id);
  }
});
