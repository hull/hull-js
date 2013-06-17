/**
 *
 * List all conversations that a user is a part of in this app
 *
 * ## Example
 *
 *     <div data-hull-widget="conversations@hull"></div>
 *
 * ## Option:
 *
 * ## Template:
 *
 * - `conversations`: 
 *
 * ## Datasource:
 *
 * - `conversations`: List of all the conversations for the user
 *
 * ## Action:
 *
 */

/*global define:true, _:true */
define({
  type: 'Hull',

  templates: ['conversations'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
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

  beforeRender: function(data){
    "use strict";
    data.conversations = data.conversations;
    return data;
  }
});
