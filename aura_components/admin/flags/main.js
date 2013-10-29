/**
 *
 * Allows an administrator to review all the flags on objects considered as inappropriate
 *
 * @name Flags
 * @param {String} id Defaults to "app", can be "app" or "org"
 * @template {main} Displays the flags' review table if the user is an admin
 * @datasource {flags} The list of flags for the current app
 * @example <div data-hull-component="admin/flags@hull"></div>
 */

Hull.component({
  type: 'Hull',
  templates: ['main'],
  refreshEvents: ['model.hull.me.change'],
  datasources: {
    'flags': ':id/flagged'
  },
  options: {
    id: 'app'
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
  actions: {
    'delete': function (evt, ctx) {
      var self = this;
      this.api(ctx.data.id, 'delete').then(function () {
        self.render();
      });
    },
    unflag: function (evt, ctx) {
      var self = this;
      this.api(ctx.data.id + '/flag?all=1', 'delete').then(function () {
        self.render();
      });
    }
  }
});

