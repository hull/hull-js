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

  require: ['spin.min', 'ladda.min', 'bootstrap-modal', 'bootstrap-modalmanager', 'datagrid'],

  renderError: function(err) {
    if (err.message.status === 401) {
      this.html('You are not authorized to list users');
    }
  },

  datasources: {
    users: {
      provider: 'admin@:namespace',
      path: 'users'
    }
  },

  initialize: function() {
    this.query = {};
    this.currentQuery = {};
    this.injectLinkTag(this.options.baseUrl + '/ladda-themeless.min.css');
    this.injectLinkTag(this.options.baseUrl + '/userlist.min.css');
    this.injectLinkTag(this.options.baseUrl + '/bootstrap-modal.min.css');
    this.injectLinkTag(this.options.baseUrl + '/fuelux.min.css');
    this.injectLinkTag(this.options.baseUrl + '/fuelux-responsive.min.css');
  },

  /**
   *  @FIXME Duplicated from aura_components/login/shopify/main.js
   **/
  injectedLinkTags: {},
  injectLinkTag: function(url) {
    if (this.injectedLinkTags[url]) { return; }

    var e = document.createElement('link');
    e.href = url;
    e.rel = 'stylesheet';

    document.getElementsByTagName('head')[0].appendChild(e);

    this.injectedLinkTags[url] = true;
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
    var dom = this.sandbox.dom.find;
    this.sandbox.util._.each(this.$('.ladda-button'), function (btn) {
      var lbtn = Ladda.create(btn);
      dom(btn).data('ladda', lbtn);
    });


    var self = this;
    var datasource = {
      columns: function () {
        return [{
          property: 'picture',
          label: '',
          sortable: false,
          render: function (value, row) {
            return $('<div>')
              .attr('data-hull-component', 'admin/user_avatar@hull')
              .attr('data-hull-avatar', value);
          }
        }, {
          property: 'name',
          label: 'Name',
          sortable: true,
          render: function (name, row) {
            if (!name && row.main_identity.toLowerCase() === 'guest') {
              name = 'Guest user';
            }
            var email = row.email || ''
            var $name = $('<p class="name">').text(name);
            var $email = $('<span class="email">');
            var $emailAnchor = $('<a>').attr('href', 'mailto:' + email).text(email);
            if (name) {
              if (!email) $email.hide();
              return [$name.text(name), $email.append($emailAnchor)];
            } else {
              return $name.html($emailAnchor);
            }
          }
        }, {
          property: 'created_at',
          label: 'Signed up since',
          sortable: true,
          render: function (value, row) {
            return self.sandbox.util.moment(value).fromNow();
          }
        }, {
          property: 'stats',
          label: 'Visits',
          sortable: false,
          render: function (stats, row) {
            var signInCount = 1 + parseInt(stats.sign_in_count || 0);
            var $total = $('<p>')
              .text('Total: ')
              .append($('<strong>').text(signInCount));
            var $latest = $('<small>').text('Latest: ').append($('<strong>').text(self.sandbox.util.moment(row.last_seen_at || row.created_at).fromNow()));

            return [$total, $latest];
          }
        }, {
          property: 'main_identity',
          label: 'Identities',
          sortable: false,
          render: function (value, row) {
            var providers = self.getLoginProviders(row);
            return self.sandbox.util._.map(providers, function (provider) {
              return $('<i>').addClass('icon-' + provider);
            });
          }
        }];
      },
      data: function (options, callback) {
        var ds = self.datasources.users;
        ds.def.params.page = (options.pageIndex || 0) + 1;
        ds.def.params.per_page = options.pageSize || 30;
        if (options.sortProperty) {
          ds.sort(options.sortProperty, (options.sortDirection || '').toUpperCase())
        }
        ds.fetch().then(function (obj) {
          var payload = {
            data: obj.toJSON(),
            start: (ds.def.params.page - 1) * ds.def.params.per_page + 1,
            end: (ds.def.params.page - 1) * ds.def.params.per_page + obj.length,
            count: 55,
            pages: 2,
            page: ds.def.params.page
          };
          callback(payload);
        })
      }
    };
    var $table = self.$el.find('.datagrid');
    $table.datagrid({
      dataSource: datasource,
      enableSelect: true,
      primaryKey: 'id',
    }).on('loaded', function () {
      $table.find('a').on('click', function (e) {
        e.stopImmediatePropagation();
        e.stopPropagation();
      });
      Hull.parse(self.$el);
    }).on('itemSelected', function (evt, row) {
      self.sandbox.emit('hull.user.select', row.id);
    });



  },

  getLoginProviders: function (user) {
    var map = this.sandbox.util._.map;
    var self = this;
    var providers = [user.main_identity];
    map(user.identities, function (identity) {
      var provider = identity.provider;
      if (providers.indexOf(provider) === -1) {
        providers.push(provider);
      }
    });
    return providers;
  },

  actions: {
    nextPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isLast()) {
        this.$('[data-hull-action=nextPage].ladda-button').data('ladda').start();
        datasource.next();
        this.render();
      }
    },

    previousPage: function() {
      var datasource = this.datasources.users;
      if (!datasource.isFirst()) {
        this.$('[data-hull-action=previousPage].ladda-button').data('ladda').start();
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
