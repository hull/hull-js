/**
 * ## Conversations
<<<<<<< HEAD
 * List all conversations within this app
=======
>>>>>>> b65acbc2676e1d60b37ad6233733ee3a3d4c0aed
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
<<<<<<< HEAD
 * - `conversations`: Display a list of conversations
=======
 * - `conversations`:
>>>>>>> b65acbc2676e1d60b37ad6233733ee3a3d4c0aed
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
      return this.api('conversations', {visibility: this.options.visibility || undefined});
    }
  },

  initialize: function() {
    this.sandbox.on('hull.conversation.reload', function(id) {
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
  },
  
});
