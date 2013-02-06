/**
 * Widget Activity
 *
 * Not ready yet
 */
define({
  type: "Hull",
  templates: ["activity"],
  options: {
    per_page: 5,
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
      this.query.limit = this.options.limit || this.options.per_page;
      this.query.page = this.query.page || 1;
      this.query.page += 1;
      this.render();
    },
    previousPage: function() {
      delete this.query.skip;
      this.query.limit = this.options.limit || this.options.per_page;
      this.query.page = this.query.page || 1;
      if (this.query.page > 1) {
        this.query.page -= 1;
        this.render();
      }
    },
    fetchMore: function() {
      var originalLimit = this.options.limit || this.options.per_page;
      this.query.limit += originalLimit;
      this.render();
    }
  },

  initialize: function() {
    var query = {};

    if (this.options.page) {
      query.page = this.options.page;
    } else {
      query.skip = this.options.skip || 0;
    }

    query.limit = this.options.limit || this.options.per_page;
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
    data.query = this.query;
    return data;
  }



});
