/**
 *
 * Displays the list of users of your app.
 *
 * Access to this component is limited to the administrators, you will need to be logged in to your admin on hullapp.io to access data.
 *
 * @name Users List
 * @template {users}     Displays the list of the users.
 * @template {forbidden} A message to be displayed when the credentials don't allow access to the data
 * @datasource {users} The list of users (Only readable by admins)
 * @example <div data-hull-component="admin/users_list@hull"></div>
 */

Hull.component({
  type: 'Hull',

  templates: ['users_list'],

  refreshEvents: ['model.hull.me.change'],

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: 'users'
  },

  initialize: function() {
    this.query = {};
    this.currentQuery = {};
  },

  beforeRender: function(data){
    var datasource = this.datasources.users;

    data.showPagination = datasource.isPaginable();
    data.showNextButton = !datasource.isLast();
    data.showPreviousButton = !datasource.isFirst();

    data.currentQuery = this.currentQuery;

    data.filters = {
      All: { action: 'resetFilter', isActive: this.query.approved == null },
      Approved: { action: 'filterApproved', isActive: this.query.approved === true },
      Unapproved: { action: 'filterUnapproved', isActive: this.query.approved === false }
    };
  },

  afterRender: function() {
    var $searchForm = this.$('.js-hull-users-search');
    $searchForm.on('submit', this.sandbox.util._.bind(function(e) {
      e.preventDefault();
      this.search($searchForm.find('.js-hull-users-search-query').val());
    }, this));
  },

  actions: {
    nextPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isLast()) {
        datasource.next();
        this.render();
      }
    },

    previousPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isFirst()) {
        datasource.previous();
        this.render();
      }
    },

    selectUser: function(event, action) {
      this.sandbox.emit('hull.user.select', action.data.id);
    },

    sort: function(event, action) {
      this.sort(action.data.field, action.data.direction);
    },

    resetSearch: function() {
      delete this.query.email;
      this.filter();
    },

    resetFilter: function() {
      delete this.query.approved;
      this.filter();
    },

    filterApproved: function() {
      this.query.approved = true;
      this.filter();
    },

    filterUnapproved: function() {
      this.query.approved = false;
      this.filter();
    }
  },

  sort: function(field, direction) {
    this.datasources.users.sort(field, direction);
    this.render();
  },

  filter: function() {
    if(this.queryHasChanged()) {
      this.datasources.users.where(this.query);
      this.render();

      this.currentQuery = this.sandbox.util._.clone(this.query);
    }
  },

  queryHasChanged: function() {
    var _ = this.sandbox.util._;

    if (_.isEmpty(this.query) && _.isEmpty(this.currentQuery)) { return false; }
    if (_.size(this.query) !== _.size(this.currentQuery)) { return true; }

    return !this.sandbox.util._.every(this.query, function(v, k) {
      return this.currentQuery[k] === v;
    }, this);
  },

  search: function(email) {
    var query;
    if (!this.sandbox.util._.string.isBlank(email)) {
      this.query.email = email;
    } else {
      delete this.query.email;
    }

    this.filter();
  }
});
