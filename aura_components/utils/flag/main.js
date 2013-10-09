/**
 * 
 * Allows a user to flag an object considered as inappropriate
 *
 * @name Flag
 * @param {String} id/uid Required, The object you want to comment on.
 * @param {String} text Optional, allows to customize the message displayed as a confirmation for flagging
 * @datasource {flaggedByMe} Indicates whether the object has been flagged by the current user ("me")
 * @template {main} Displays the flag button if the user os logged in
 * @example <div data-hull-component="utils/flag@hull" data-hull-id="app"></div>
 * @example <div data-hull-component="utils/flag@hull" data-hull-uid="http://hull.io"></div>
 */

Hull.component({
  type: 'Hull',
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
