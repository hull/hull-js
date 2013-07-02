/**
 *
 * List the current participants of a conversation, and allow users to follow/unfollow it
 *
 * ## Example
 *
 *     <div data-hull-widget="conversation_participants@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The id of the conversation object
 *
 * ## Template:
 *
 * - `participants`:
 *
 * ## Datasource:
 *
 * - `conversation`: The conversation
 *
 * ## Action:
 *
 * - `follow`: Join/follow the current converstion
 */

/*global define:true, _:true */
define({
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

    this.api(this.options.id + '/participants', 'put').then(_.bind(function() {
      this.focusAfterRender = true;
      this.render();
    }, this));
  }
});
