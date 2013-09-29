/**
 * List the current participants of a conversation, and allow users to follow/unfollow it
 *
 * @name Participants
 * @param {String} id Required The conversation object - This must a conversation ID. Use the '/UID/conversations' api call to get conversation IDs for an entity or hull object.
 * @param {Boolean} focus Optional Focus after render
 * @datasource {conversations} A conversation
 * @example <div data-hull-component="conversation/participants@hull" data-hull-id="OBJECT_ID"></div>
 */

Hull.define({
  type: 'Hull',

  templates: ['participants'],

  refreshEvents: ['model.hull.me.change'],

  actions: {
    follow: 'follow'
  },

  options: {
    focus: false
  },

  datasources: {
    conversation: ':id'
  },

  beforeRender: function(data, errors){
    "use strict";
    data.errors = errors;
    return data;
  },

  afterRender: function() {
    "use strict";
  },

  follow: function (e/*, data*/) {
    "use strict";
    e.preventDefault();

    this.api(this.options.id + '/participants', 'put').then(this.sandbox.util._.bind(function() {
      this.focusAfterRender = true;
      this.render();
    }, this));
  }
});
