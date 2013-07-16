/**
 * ## Conversations
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
 * - `conversations`: Table of conversations
 *
 * ## Datasource:
 *
 * - `conversations`: List of all the conversations for the user
 *
 * ## Action:
 *
 */

/*global define:true */
Hull.define({
  type: 'Hull',

  templates: ['conversations'],

  refreshEvents: ['model.hull.me.change'],

  options: {
    focus: false
  },

  datasources: {
    conversations: function () {
      "use strict";
      return this.api('conversations', {visibility: this.options.visibility || undefined});
    }
  },

  beforeRender: function(data, errors){
    "use strict";
    data.errors = errors;
    return data;
  }
});
