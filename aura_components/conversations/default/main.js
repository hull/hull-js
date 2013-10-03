/**
 * Loads the first conversation available for the subject. If none returns, will create one for for you.
 *
 * @name Default
 * @param {String} id/uid Required Converation subject identifier
 * @datasource {conversations} List of conversations
 * @example <div data-hull-component="conversations/default@hull" data-hull-id="app"></div>
 */
Hull.component({
  templates: ['default'],

  refreshEvents: ['model.hull.me.change'],

  options: {
    focus: false
  },

  datasources: {
    conversations: function () {
      return this.api(this.id + '/conversations');
    }
  },

  beforeRender: function(data){
    "use strict";
    // Use the first conversation that comes back
    if(data.conversations.length > 0) {
      data.conversationId = data.conversations[0].id;
    }
    else {
      // Or create a new conversation by default
      var attrs = {
        name: this.options.conversationName,
        description: this.options.description
      }
      this.api(this.id + '/conversations', 'post', attrs).then(this.sandbox.util_.bind(function(convo) {
        self.conversationId = convo.id;
        this.render();
      }, this));
    }
    return data;
  }
});
