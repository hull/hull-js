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
 * - `conversations`: Display a list of conversations
 *
 * ## Datasource:
 *
 * - `conversations`: List of all conversations
 *
 * ## Action:
 *
 * - `pickConvo`: Select a conversation.
 */

/*global define:true, _:true */
define({
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
      this.options.visibility
      var url = 'conversations'
      if(this.options.visibility) url += '?visibility=' + this.options.visibility;
      return this.api(url);
    }
  },

  initialize: function() {
    this.sandbox.on('hull.conversation.reload', function(id) {
      this.render();
    }, this)
  },
  
  beforeRender: function(data){
    "use strict";
    data.conversations = data.conversations;
    return data;
  },
  
  pickConversation: function(e, action) {
    this.sandbox.emit('hull.conversation.pick', action.data.id);
  },
  
});
