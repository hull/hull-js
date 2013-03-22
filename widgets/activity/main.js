/**
 * # Activity
 *
 * Activity streams from the actions on your app.
 *
 * ## Example
 *
 *     <div data-hull-widget="activity@hull"></div>
 *
 * ## Options
 *
 * - `navigation`: Optional, Choose between `infinite` or `paged` navigation. `infinite` by default.
 * - `perPage`: Optional, number of item to display per page. 10 by default.
 * - `startPage`: Optional, the first page that will be displayed. By default the first page will be retrieve. If you use `infinite` navigation and set `startPage` to another page, your user will not be able to see all items.
 *
 * ## Template
 *
 * - `activity`: Display items or a message that say that there is no activity.
 *
 * ## Datasource
 *
 * - `activities`: The actiity stream that will be displayed.
 */
define({
  type: 'Hull',

  templates: [
    'activity'
  ],

  options: {
    perPage: 10,
    page: 1
  },

  datasources: {
    activities: function() {
      return this.api('hull/app/activity', this.query);
    }
  },

  actions: {
    nextPage: function() {
      delete this.query.skip;

      this.query.limit = this.options.limit || this.options.perPage;
      this.query.page = this.query.page || 1;
      this.query.page += 1;
      this.render();
    },

    previousPage: function() {
      delete this.query.skip;

      this.query.limit = this.options.limit || this.options.perPage;
      this.query.page = this.query.page || 1;

      if (this.query.page > 1) {
        this.query.page -= 1;
        this.render();
      }
    },

    fetchMore: function($el) {
      $el.text('loading items...');

      var originalLimit = this.options.limit || this.options.perPage;
      this.query.limit += originalLimit;
      this.render();
    }
  },

  initialize: function() {
    var query = {};

    if (this.options.startPage) {
      query.page = this.options.startPage;
    } else {
      query.skip = this.options.skip || 0;
    }

    query.limit = this.options.limit || this.options.perPage;
    query.where = this.options.where || {};

    if (this.options.verb) {
      query.where.verb = this.options.verb;
    }

    if (this.options.object_type) {
      query.where.obj_type = this.options.object_type;
    }

    var ObjectIdRegexp = /^[0-9a-f]{24}/i;

    if (this.options.after) {
      var after = this.options.after;
      if (ObjectIdRegexp.test(after)) {
        query.where._id = { '$gte' : after };
      } else if (moment(after).isValid()) {
        query.where.created_at = { "$gte" : moment(after).toDate() };
      }
    } else if (this.options.before) {
      var before = this.options.before;
      if (ObjectIdRegexp.test(before)) {
        query.where._id = { '$lte' : before };
      } else if (moment(before).isValid()) {
        query.where.created_at = { "$lte" : moment(before).toDate() };
      }
    }

    this.query = query;
  },

  beforeRender: function(data) {
    data.isPaged = (this.options.navigation === 'paged');
    data.query = this.query;

    console.log("DATA", data);

    return data;
  }
});
