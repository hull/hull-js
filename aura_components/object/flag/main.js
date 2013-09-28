/**
 * ## Flagging component
 *
 * Allows a user to flag an object considered as inappropriate
 *
 * ### Example
 *
 *     <div data-hull-component="flag@hull" data-hull-id="HULL_OBJECT_ID"></div>
 *
 * or if you want to reference any other Entity (for example the id of a product)
 *
 *     <div data-hull-component="flag@hull" data-hull-uid="YOUR_OBJECT_ID"></div>
 *
 * ### Option:
 *
 * - `id` or `uid`: Required, The object you want to comment on.
 * - `text`: optional, allows to customize the message displayed as a confirmation for flagging
 *
 * ### Template:
 *
 * - `main`: Displays the flag button if the user os logged in
 *
 * ### Datasource:
 *
 * - `flaggedByMe`: Indicates whether the object has been flagged by the current user ("me")
 *
 * ### Action:
 *
 * - `flag`: Submits a new flag.
 */
Hull.define({
  type: "Hull",
  templates: ['main'],
  refreshEvents: ['model.hull.me.change'],
  datasources: {
    'flaggedByMe': function () {
      "use strict";
      if (!this.loggedIn()) {
        return false;
      }
      return this.hasFlagsByMe();
    }
  },
  options: {
    "text": "Do you want to report this content as inappropriate?"
  },
  initialize: function () {
    "use strict";
    if (!this.options.id) {
      throw new Error('Missing id of the object to flag');
    }
  },
  beforeRender: function (data) {
    "use strict";
    data.flagState = data.flaggedByMe ? 'disabled' : '';
  },
  actions: {
    flag: function () {
      "use strict";
      var self = this;
      if (!this.data.flaggedByMe && confirm(this.options.text)) {
        this.api.post(this.options.id + '/flag').then(function () {
          self.render();
        });
      }
    }
  },
  hasFlagsByMe: function () {
    "use strict";
    var filter  = this.sandbox.util._.filter;
    var dfd     = this.sandbox.data.deferred();
    var path    = this.options.id + '/flags';
    var myId    = this.api.model('me').get('id');

    this.api(path).then(function (flags) {
      var myFlags = filter(flags, function (flag) {
        return flag.reporter_id === myId;
      });
      dfd.resolve(myFlags.length > 0);
    });
    return dfd;
  }
});
