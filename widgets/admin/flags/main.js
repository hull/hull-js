/**
 * ## Flags review
 *
 * Allows an administrator to review all the flags on objects considered as inappropriate
 *
 * ### Example
 *
 *     <div data-hull-widget="admin/flags@hull"></div>
 *
 *
 * ### Template:
 *
 * - `main`: Displays the flags' review table if the user is an admin
 *
 * ### Datasource:
 *
 * - `flags`: The list of flags for the current app
 *
 * ### Action:
 *
 * - `markReviewed`: Marks a flag as reviewed
 */
Hull.define({
  type: "Hull",
  templates: ['main'],
  refreshEvents: ['model.hull.me.change'],
  datasources: {
    'flags': 'flags/'
  },
  onFlagsError: function (err) {
    return [];
  },
  markReviewed: function () {
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
  },
  beforeRender: function (data) {
    console.log(data);
  }
});

