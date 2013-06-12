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
      return this.api('conversations');
    }
  },

  beforeRender: function(data){
    "use strict";
    console.log(data)
    data.conversations = _.toArray(data.conversations);
    return data;
  }
});
