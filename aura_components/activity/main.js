/**
 * ## Activity feed
 *
 * Activity streams from the actions on your app.
 *
 * This widget contains the translation map from the Activty Streams format to your own choice of wording.
 * Everything is stored in the "map" hash in the widget.
 *
 * Every activity is made of an `actor`, a `verb`, an `object`, and a `target`
 *
 * For now, you have to copy the code for this widget and change it to fit it to your application.
 * We will make this easier in the future.
 *
 * ### Example
 *
 *     <div data-hull-widget="activity@hull" data-hull-per-page="10"></div>
 *
 * ### Options
 *
 * - `navigation`: Optional, Choose between `infinite` or `paged` navigation. `infinite` by default.
 * - `per-page`: Optional, number of item to display per page. 10 by default.
 * - `start-page`: Optional, the first page that will be displayed. By default the first page will be retrieved. If you use `infinite` navigation and set `startPage` to another page, your user will not be able to see all items.
 * - `where`: Optional, a mongodb-formatted query. See the docs for more details
 * - `friends-only`: Optional, only show the activities for the user's friends
 * - `skip`: Optional, skip the n first results
 * - `limit`: Optional, only return n results
 * - `before`: Optional
 * - `object-type`: Optional, limit to a specific object type
 * - `where`: Optional, pipe in a mongo query
 * - `verb`: Optional, limit activities to a specific verb
 *
 * ### Template
 *
 * - `activity`: Display items or a message that say that there is no activity.
 *
 * ### Datasource
 *
 * - `activities`: The activity stream that will be displayed.
 */
Hull.define({
  type: 'Hull',

  templates: [
    'activity'
  ],

  options: {
    perPage: 10,
    page: 1
  },

  map : {
    fallback: {
      verb:{
        receive: 'received',
        share: 'shared',
        add: 'added',
        post: 'posted',
        like: 'liked',
        unlike: 'unliked',
        review: 'reviewed',
        create: 'created'
      },
      object:{
        entity: 'an entity',
        image: 'an image',
        status: 'a status',
        photo: 'a picture',
        question: 'a question',
        item: 'an object',
        badge: 'a badge',
        link: 'a link',
        video: 'a video',
        note: 'a note',
        comment: 'a comment',
        review: 'a review'
      },
      target:{
        facebook_app: 'Facebook',
        twitter_app: 'Twitter'
      }
    },
    create:{
      review:'reviewed',
      comment:'posted a comment on'
    }
  },

  datasources: {
    activities: function() {
      var path, id = this.id || 'app';
      if (this.options.friendsOnly) {
        path = id + "/friends_activity";
      } else {
        path = id + "/activity";
      }
      return this.api(path, this.query);
    }
  },

  actions: {
    nextPage: function() {
      delete this.query.skip;

      this.query.limit = this.options.limit || this.options.perPage;
      this.query.page = this.query.page || 1;
      this.query.page += 1;
      this.render();
      return false;
    },

    previousPage: function() {
      delete this.query.skip;

      this.query.limit = this.options.limit || this.options.perPage;
      this.query.page = this.query.page || 1;

      if (this.query.page > 1) {
        this.query.page -= 1;
        this.render();
      }
      return false;
    },

    fetchMore: function(e, params) {
      params.el.text('Loading...');
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
    data.map = this.map;
    data.isPaged = (this.options.navigation === 'paged');
    data.query = this.query;
    return data;
  }
});
