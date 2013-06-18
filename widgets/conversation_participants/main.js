/**
 *
 * Allow to start and reply to a conversation on an object of the current application.
 *
 * ## Example
 *
 *     <div data-hull-widget="conversation@hull" data-hull-id="OBJECT_ID"></div>
 *
 * ## Option:
 *
 * - `id`: Required, The id of the specific conversation object
 * 
 * OR
 *
 * - `subjectid`: Required, The object you want to start a conversation upon.
 * - `participantid`: Required, comma-separated ids of the participants
 *
 * ## Template:
 *
 * - `conversations`: 
 * - `participants`: 
 *
 * ## Datasource:
 *
 * - `conversation`: The conversation
 *
 * ## Action:
 *
 * - `message`: Submits a new message.
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
    conversation: function () {
      if (this.options.id) {
        return this.api(this.options.id );
      }
      else {
        return null;
      }
    }
  },

  beforeRender: function(data){
    "use strict";
    return data;
  },
  
  afterRender: function() {
    "use strict";
  },
  
  follow: function (e, data) {
    "use strict";
    e.preventDefault();
    
    this.api(this.options.id + '/participants', 'put').then(_.bind(function() {
      this.focusAfterRender = true;
      this.render();
    }, this));
  }
});
